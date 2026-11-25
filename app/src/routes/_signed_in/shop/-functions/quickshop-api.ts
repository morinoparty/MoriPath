import { z } from "zod";
import { getMinecraftAssetsUrl } from "../../../../lib/mc-assets";
import { runInBackground } from "../../../../lib/run-in-background";
import { getServerUrl } from "../../../../lib/server-list";
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
// アイテム名の辞書は Minecraft のバージョンを上げるまで変わらない
const LANG_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

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

/**
 * isolate のメモリに持っている一覧 (古さは問わない)。
 * Cache API は呼び出しごとに課金されるため使わず、isolate をまたいだ共有はしない
 */
async function readShopSnapshot(): Promise<ShopSnapshot | undefined> {
    return shopsMemory;
}

/** 一覧を API から取り直し、isolate のメモリに入れる */
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
        // 欠けた一覧は古いものとして扱い、次のリクエストで取り直させる
        fetchedAt: partial ? startedAt - SHOPS_FRESH_MS : startedAt,
    };
    console.info(
        `お店の一覧を ${Date.now() - startedAt}ms で取り直しました (${shops.length} 件${partial ? "、一部欠け" : ""})`,
    );
    shopsMemory = snapshot;
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
