import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { toDashedUuid } from "../../../../lib/uuid";

// mc-api の一括取得 (POST /v1/players/lookup) が受け付ける 1 回あたりの件数
const BATCH_LIMIT = 100;
// プレイヤー名はめったに変わらないため、一度引いたら長めに使い回す
const PLAYER_NAME_STALE_MS = 60 * 60 * 1000;
// 一括取得が遅いときに名前の表示をいつまでも待たせない
const FETCH_TIMEOUT_MS = 5000;

// POST /v1/players/lookup の応答。名前以外 (skin など) は使わないので読まない。
// プレイヤーが登録されていなければ null、登録済みでも名前をまだ取得していなければ name が null
const lookupResponseSchema = z.object({
    players: z.record(
        z.string(),
        z.object({ name: z.string().nullable() }).nullable(),
    ),
});

/**
 * UUID (最大 BATCH_LIMIT 件) → 名前を mc-api の POST /v1/players/lookup で 1 回で引く。
 * 登録されていないプレイヤーは null。名前がまだ無いプレイヤーと通信に失敗した分は結果に含めない
 */
async function fetchPlayerNames(
    mcApiUrl: string,
    uuids: readonly string[],
): Promise<Map<string, string | null>> {
    const names = new Map<string, string | null>();
    // 形のおかしい ID が 1 件でもあると全体が 400 になるため、UUID にそろえられたものだけを送る
    const idByUuid = new Map<string, string>();
    for (const uuid of uuids) {
        const id = toDashedUuid(uuid);
        if (id) {
            idByUuid.set(uuid, id);
        } else {
            names.set(uuid, null);
        }
    }
    if (idByUuid.size === 0) {
        return names;
    }
    const response = await fetch(`${mcApiUrl}/v1/players/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...new Set(idByUuid.values())] }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
        throw new Error(`mc-api が ${response.status} を返しました`);
    }
    const { players } = lookupResponseSchema.parse(await response.json());
    // 応答は送った ID の文字列そのままのキーで返る
    for (const [uuid, id] of idByUuid) {
        const player = players[id];
        if (player === null) {
            names.set(uuid, null);
        } else if (player?.name) {
            names.set(uuid, player.name);
        }
    }
    return names;
}

interface Waiter {
    resolve: (name: string | null) => void;
    reject: (error: unknown) => void;
}

// 同じ描画で求められた UUID を 1 回の取得にまとめるための待ち行列 (mc-api の URL ごと)
const queues = new Map<string, Map<string, Waiter[]>>();

/** 待ち行列にたまった UUID を BATCH_LIMIT 件ずつまとめて引き、待っている行に配る */
function flushQueue(mcApiUrl: string): void {
    const queue = queues.get(mcApiUrl);
    queues.delete(mcApiUrl);
    if (!queue) {
        return;
    }
    const uuids = [...queue.keys()];
    for (let start = 0; start < uuids.length; start += BATCH_LIMIT) {
        const chunk = uuids.slice(start, start + BATCH_LIMIT);
        void fetchPlayerNames(mcApiUrl, chunk)
            .catch(() => new Map<string, string | null>())
            .then((names) => {
                for (const uuid of chunk) {
                    for (const waiter of queue.get(uuid) ?? []) {
                        const name = names.get(uuid);
                        if (name === undefined) {
                            // 引けなかった行 (名前がまだ無いものを含む) だけをエラーにし、クエリの再試行に任せる
                            waiter.reject(
                                new Error(`${uuid} の名前を引けません`),
                            );
                        } else {
                            waiter.resolve(name);
                        }
                    }
                }
            });
    }
}

/** UUID の名前を引く。同じタイミングで呼ばれた分は 1 回の取得にまとめる */
function loadPlayerName(
    mcApiUrl: string,
    uuid: string,
): Promise<string | null> {
    return new Promise((resolve, reject) => {
        let queue = queues.get(mcApiUrl);
        if (!queue) {
            queue = new Map();
            queues.set(mcApiUrl, queue);
            // 同じ描画でマウントした行の分がそろってから引く
            setTimeout(() => flushQueue(mcApiUrl), 0);
        }
        const waiters = queue.get(uuid) ?? [];
        waiters.push({ resolve, reject });
        queue.set(uuid, waiters);
    });
}

/** プレイヤー名のクエリ。表示している行のぶんだけ作られ、取得は loadPlayerName がまとめる */
export const playerNameQueryOptions = (mcApiUrl: string, uuid: string) =>
    queryOptions({
        queryKey: ["player-name", uuid],
        queryFn: () => loadPlayerName(mcApiUrl, uuid),
        staleTime: PLAYER_NAME_STALE_MS,
        gcTime: PLAYER_NAME_STALE_MS,
        retry: 1,
    });
