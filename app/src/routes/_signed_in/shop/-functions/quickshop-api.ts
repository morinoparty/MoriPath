import { z } from "zod";
import { getMinecraftAssetsUrl } from "../../../../lib/mc-assets";
import { getMcApiUrl } from "../../../../lib/player-api";
import { getServerUrl } from "../../../../lib/server-list";
import {
    readSharedCache,
    runInBackground,
    writeSharedCache,
} from "../../../../lib/shared-cache";
import { type QuickShop, quickShopPageSchema } from "../-types/shop";
import type { ItemLang } from "./item-name";
import {
    scanShops,
    type ShopPageResult,
    toCursor,
    toSegmentStarts,
} from "./scan-shops";

// 1 ページで取れる最大件数 (API 側で 1000 件に丸められる)
const PAGE_LIMIT = 1000;
// 区間の大きさ。お店が少し増えても 1 ページに収まるよう、上限より少なめに区切る
const SEGMENT_SIZE = 900;
// 区間を同時に取る数。API はゲームサーバーのチャンクを読んで在庫を数えるため、並べすぎない
const SCAN_CONCURRENCY = 4;
// 1 回の走査で取るページ数の上限 (ページ送りが止まらなくなったときの安全弁)
const MAX_PAGES = 15;
// 外部 API が遅いときにページ全体を待たせない
const FETCH_TIMEOUT_MS = 5000;
// この時間までは一覧をそのまま使う
const SHOPS_FRESH_MS = 60 * 1000;
// この時間までは古い一覧をすぐ返し、裏で取り直す (stale-while-revalidate)
const SHOPS_STALE_MS = 10 * 60 * 1000;
// 同じ isolate で裏の取り直しを重ねない間隔
const SHOPS_REFRESH_GUARD_MS = 30 * 1000;
// 共有キャッシュに一覧を残しておく長さ。古すぎて使えなくなっても、区間の目安として読む
const SHOPS_SHARED_MAX_AGE_S = 24 * 60 * 60;
const SHOPS_SHARED_KEY = "quickshop-shops";
// アイテム名の辞書は Minecraft のバージョンを上げるまで変わらない
const LANG_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
// プレイヤー名はめったに変わらない。引けなかった UUID は早めに引き直す
const OWNER_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const OWNER_MISS_CACHE_TTL_MS = 10 * 60 * 1000;
// 持ち主の名前を同時に引く数
const OWNER_LOOKUP_CONCURRENCY = 8;
// 引けた名前を isolate 間で共有する。共有キャッシュを読み直す間隔と残す長さ
const OWNER_SHARED_KEY = "quickshop-owner-names";
const OWNER_SHARED_SYNC_MS = 5 * 60 * 1000;
const OWNER_SHARED_MAX_AGE_S = 24 * 60 * 60;

/** 組み立て済みのお店の一覧 */
export interface ShopSnapshot {
    /** ID の昇順のお店 */
    shops: QuickShop[];
    /** 次に取り直すときの区間の始まり */
    segmentStarts: number[];
    /** 取得した時刻 (ms) */
    fetchedAt: number;
}

// Workers ではリクエストをまたいで Promise を共有できないため、取得し終えた値だけを持つ
let shopsMemory: ShopSnapshot | undefined;
// 裏の取り直しを始めた時刻 (同じ isolate で重ねないため)
let shopsRefreshStartedAt = 0;
let langCache: { value: ItemLang; expiresAt: number } | undefined;
const ownerNameCache = new Map<
    string,
    { name: string | null; expiresAt: number }
>();
let ownerSharedSyncedAt = 0;

/** お店の一覧 API を 1 ページ取る。cursor より大きい ID のお店が返る */
async function fetchShopPage(cursor: number): Promise<ShopPageResult> {
    const params = new URLSearchParams({ limit: String(PAGE_LIMIT) });
    if (cursor > 0) {
        params.set("cursor", String(cursor));
    }
    const response = await fetch(
        `${getServerUrl("main")}/api/v1/plugins/quickshop/shops?${params}`,
        { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) },
    );
    if (!response.ok) {
        throw new Error(`お店の一覧を取得できません: ${response.status}`);
    }
    const data = quickShopPageSchema.parse(await response.json());
    return {
        shops: data.shops,
        nextCursor: toCursor(data.nextCursor),
        hasMore: data.hasMore,
    };
}

/** お店の一覧の 1 ページ目だけを取る。残りを待たずに画面を出すときに使う */
export async function fetchFirstShopPage(): Promise<ShopPageResult> {
    return fetchShopPage(0);
}

/** isolate のキャッシュと共有キャッシュのうち新しいほうの一覧 (古さは問わない) */
async function readShopSnapshot(): Promise<ShopSnapshot | undefined> {
    const now = Date.now();
    // isolate に新しい一覧があれば、共有キャッシュは読まない
    if (shopsMemory && now - shopsMemory.fetchedAt < SHOPS_FRESH_MS) {
        return shopsMemory;
    }
    const shared = await readSharedCache<ShopSnapshot>(SHOPS_SHARED_KEY);
    if (
        shared &&
        (!shopsMemory || shared.value.fetchedAt > shopsMemory.fetchedAt)
    ) {
        shopsMemory = shared.value;
    }
    return shopsMemory;
}

/** 一覧を API から取り直し、isolate と共有キャッシュに入れる */
async function refreshShopSnapshot(
    previous: ShopSnapshot | undefined,
): Promise<ShopSnapshot> {
    const startedAt = Date.now();
    // 前回の一覧から作った区間で並行に取る。前回が無ければ 1 ページずつ順に取る
    const { shops, partial } = await scanShops(
        fetchShopPage,
        previous?.segmentStarts ?? [0],
        { concurrency: SCAN_CONCURRENCY, maxPages: MAX_PAGES },
    );
    const snapshot: ShopSnapshot = {
        shops,
        segmentStarts: toSegmentStarts(shops, SEGMENT_SIZE),
        fetchedAt: startedAt,
    };
    console.info(
        `お店の一覧を ${Date.now() - startedAt}ms で取り直しました (${shops.length} 件${partial ? "、一部欠け" : ""})`,
    );
    shopsMemory = snapshot;
    // 欠けた一覧は他の isolate に配らず、次のリクエストで取り直させる
    if (!partial) {
        runInBackground(
            writeSharedCache(
                SHOPS_SHARED_KEY,
                { value: snapshot, savedAt: snapshot.fetchedAt },
                SHOPS_SHARED_MAX_AGE_S,
            ),
        );
    }
    return snapshot;
}

/**
 * キャッシュ済みの一覧があれば返す (API は待たない)。
 * 古くなりかけていれば、そのまま返しつつ裏で取り直す (stale-while-revalidate)
 */
export async function peekShopSnapshot(): Promise<ShopSnapshot | undefined> {
    const snapshot = await readShopSnapshot();
    if (!snapshot) {
        return undefined;
    }
    const now = Date.now();
    const age = now - snapshot.fetchedAt;
    if (age >= SHOPS_STALE_MS) {
        return undefined;
    }
    if (
        age >= SHOPS_FRESH_MS &&
        now - shopsRefreshStartedAt >= SHOPS_REFRESH_GUARD_MS
    ) {
        shopsRefreshStartedAt = now;
        runInBackground(refreshShopSnapshot(snapshot));
    }
    return snapshot;
}

/** お店の一覧をすべて。キャッシュに使える一覧が無ければ、その場で取り直す */
export async function getAllShops(): Promise<ShopSnapshot> {
    const cached = await peekShopSnapshot();
    if (cached) {
        return cached;
    }
    // 古すぎる一覧も、区間の目安としては使える
    return refreshShopSnapshot(await readShopSnapshot());
}

const langSchema = z.record(z.string(), z.string());

/** mc-assets の en_us.json (アイテムの英語名)。取れなければ null を返し、種類名の整形で代用させる */
export async function getItemLang(): Promise<ItemLang | null> {
    const now = Date.now();
    if (langCache && langCache.expiresAt > now) {
        return langCache.value;
    }
    try {
        const response = await fetch(
            `${getMinecraftAssetsUrl()}/lang/en_us.json`,
            { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) },
        );
        if (!response.ok) {
            throw new Error(`status ${response.status}`);
        }
        const value = langSchema.parse(await response.json());
        langCache = { value, expiresAt: now + LANG_CACHE_TTL_MS };
        return value;
    } catch (error) {
        console.warn("アイテム名の辞書 (en_us.json) を取得できません:", error);
        return null;
    }
}

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

/** mc-api で UUID からプレイヤー名を引く。見つからなければ null */
async function fetchOwnerName(uuid: string): Promise<string | null> {
    const response = await fetch(
        `${getMcApiUrl()}/v1/players/${encodeURIComponent(uuid)}`,
        { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) },
    );
    if (!response.ok) {
        return null;
    }
    const parsed = mcApiPlayerSchema.safeParse(await response.json());
    if (!parsed.success) {
        // 形が想定と違うと全員が UUID 表示になるため、気づけるようにログに残す
        console.warn(`mc-api の応答から ${uuid} の名前を読めません`);
        return null;
    }
    return parsed.data;
}

/** 他の isolate が引いた名前を共有キャッシュから取り込む (しばらくは読み直さない) */
async function syncSharedOwnerNames(): Promise<void> {
    const now = Date.now();
    if (now - ownerSharedSyncedAt < OWNER_SHARED_SYNC_MS) {
        return;
    }
    ownerSharedSyncedAt = now;
    const shared =
        await readSharedCache<Record<string, string>>(OWNER_SHARED_KEY);
    if (!shared) {
        return;
    }
    for (const [uuid, name] of Object.entries(shared.value)) {
        // この isolate で引いた名前のほうが新しいので上書きしない
        if (!ownerNameCache.get(uuid)?.name) {
            ownerNameCache.set(uuid, {
                name,
                expiresAt: shared.savedAt + OWNER_CACHE_TTL_MS,
            });
        }
    }
}

/** 引けている名前を共有キャッシュに書き戻す */
async function saveSharedOwnerNames(): Promise<void> {
    const now = Date.now();
    const names: Record<string, string> = {};
    for (const [uuid, entry] of ownerNameCache) {
        if (entry.name && entry.expiresAt > now) {
            names[uuid] = entry.name;
        }
    }
    await writeSharedCache(
        OWNER_SHARED_KEY,
        { value: names, savedAt: now },
        OWNER_SHARED_MAX_AGE_S,
    );
}

/** キャッシュに無い持ち主の名前を、上限つきで引いてキャッシュに入れる */
async function lookupOwnerNames(uuids: readonly string[]): Promise<void> {
    const now = Date.now();
    const queue = [...uuids];
    // 同時接続数を抑えるため、少数のワーカーで順に引く
    const worker = async () => {
        for (let uuid = queue.shift(); uuid; uuid = queue.shift()) {
            try {
                const name = await fetchOwnerName(uuid);
                ownerNameCache.set(uuid, {
                    name,
                    expiresAt:
                        now +
                        (name ? OWNER_CACHE_TTL_MS : OWNER_MISS_CACHE_TTL_MS),
                });
            } catch (error) {
                // 通信の失敗はキャッシュせず、次のリクエストで引き直す
                console.warn(`持ち主 ${uuid} の名前を引けません:`, error);
            }
        }
    };
    await Promise.all(Array.from({ length: OWNER_LOOKUP_CONCURRENCY }, worker));
    // 引けた名前は他の isolate でも使えるようにする
    await saveSharedOwnerNames();
}

export interface ResolveOwnerNamesOptions {
    /**
     * このリクエストで新たに引く上限。Workers のサブリクエスト数の上限
     * (お店のページと共有キャッシュの読み書きも数える) に余裕を残す
     */
    maxLookups: number;
    /** 引き終わるのを待つ最大の時間。過ぎたら残りは裏で引き、次のリクエストで使う */
    waitMs: number;
}

/**
 * 持ち主の UUID → プレイヤー名の対応を作る。
 * キャッシュに無いものは上限つきで引き、待ちきれなかった分や引けなかったものは対応に含めない
 */
export async function resolveOwnerNames(
    uuids: readonly string[],
    { maxLookups, waitMs }: ResolveOwnerNamesOptions,
): Promise<Map<string, string>> {
    await syncSharedOwnerNames();
    const now = Date.now();
    const unique = [...new Set(uuids)];
    const pending = unique.filter((uuid) => {
        const cached = ownerNameCache.get(uuid);
        return !cached || cached.expiresAt <= now;
    });
    if (pending.length > 0) {
        if (pending.length > maxLookups) {
            // 残りは次のリクエストで引く (それまでは UUID の先頭で表示する)
            console.warn(
                `持ち主の名前を ${maxLookups} 件だけ引き、${pending.length - maxLookups} 件は次回に回します`,
            );
        }
        const lookups = lookupOwnerNames(pending.slice(0, maxLookups));
        // 待ちきれなかった分も応答のあとで引き終え、キャッシュに入れておく
        runInBackground(lookups);
        if (waitMs > 0) {
            await Promise.race([
                lookups.catch(() => undefined),
                new Promise((resolve) => setTimeout(resolve, waitMs)),
            ]);
        }
    }
    const names = new Map<string, string>();
    for (const uuid of unique) {
        const name = ownerNameCache.get(uuid)?.name;
        if (name) {
            names.set(uuid, name);
        }
    }
    return names;
}
