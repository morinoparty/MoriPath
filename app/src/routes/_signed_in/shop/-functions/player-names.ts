import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

// mc-api の一括取得 (POST /v1/players/lookup) が受け付ける 1 回あたりの件数
const BATCH_LIMIT = 100;
// プレイヤー名はめったに変わらないため、一度引いたら長めに使い回す
const PLAYER_NAME_STALE_MS = 60 * 60 * 1000;
// 一覧の行が多くても待たされないよう、1 件ごとの取得には時間の上限を設ける
const FETCH_TIMEOUT_MS = 5000;

// mc-api のプレイヤー情報。名前の持ち方の違い ({ name } / { username } / { data.player.username }) を吸収する
const mcApiPlayerSchema = z.union([
    z.object({ name: z.string().min(1) }).transform((value) => value.name),
    z
        .object({ username: z.string().min(1) })
        .transform((value) => value.username),
    z
        .object({
            data: z.object({
                player: z.object({ username: z.string().min(1) }),
            }),
        })
        .transform((value) => value.data.player.username),
]);

/** mc-api で UUID 1 件の名前を引く。いないプレイヤーなら null、通信の失敗は例外にする */
async function fetchPlayerName(
    mcApiUrl: string,
    uuid: string,
): Promise<string | null> {
    const response = await fetch(
        `${mcApiUrl}/v1/players/${encodeURIComponent(uuid)}`,
        { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) },
    );
    if (response.status === 404) {
        return null;
    }
    if (!response.ok) {
        throw new Error(`mc-api が ${response.status} を返しました`);
    }
    const parsed = mcApiPlayerSchema.safeParse(await response.json());
    return parsed.success ? parsed.data : null;
}

/**
 * UUID (最大 BATCH_LIMIT 件) → 名前をまとめて引く。いないプレイヤーは null、引けなかった UUID は結果に含めない。
 * いまは 1 件ずつの GET を並べているが、mc-api の POST /v1/players/lookup
 * (body { ids }、応答 { players: { [id]: { name, ... } | null } }) に切り替えるときはこの関数だけを書き換えればよい
 */
async function fetchPlayerNames(
    mcApiUrl: string,
    uuids: readonly string[],
): Promise<Map<string, string | null>> {
    const results = await Promise.allSettled(
        uuids.map((uuid) => fetchPlayerName(mcApiUrl, uuid)),
    );
    const names = new Map<string, string | null>();
    results.forEach((result, index) => {
        if (result.status === "fulfilled") {
            names.set(uuids[index], result.value);
        }
    });
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
                            // 引けなかった行だけをエラーにし、クエリの再試行に任せる
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
