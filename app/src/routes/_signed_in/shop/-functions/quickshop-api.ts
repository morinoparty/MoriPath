import { z } from "zod";
import { getMinecraftAssetsUrl } from "../../../../lib/mc-assets";
import { getMcApiUrl } from "../../../../lib/player-api";
import { getServerUrl } from "../../../../lib/server-list";
import { type QuickShop, quickShopPageSchema } from "../-types/shop";
import type { ItemLang } from "./item-name";

// 1 ページで取れる最大件数 (API 側で 1000 件に丸められる)
const PAGE_LIMIT = 1000;
// ページ送りが止まらなくなったときの安全弁
const MAX_PAGES = 10;
// 外部 API が遅いときにページ全体を待たせない
const FETCH_TIMEOUT_MS = 5000;
// お店の一覧はゲーム内で随時変わるため短めに使い回す
const SHOPS_CACHE_TTL_MS = 60 * 1000;
// アイテム名の辞書は Minecraft のバージョンを上げるまで変わらない
const LANG_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
// プレイヤー名はめったに変わらない。引けなかった UUID は早めに引き直す
const OWNER_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const OWNER_MISS_CACHE_TTL_MS = 10 * 60 * 1000;
// 1 リクエストで引く持ち主の上限。Workers のサブリクエスト数の上限に余裕を残す
const MAX_OWNER_LOOKUPS = 40;
// 持ち主の名前を同時に引く数
const OWNER_LOOKUP_CONCURRENCY = 8;

// Workers ではリクエストをまたいで Promise を共有できないため、取得し終えた値だけを持つ
let shopsCache: { value: QuickShop[]; expiresAt: number } | undefined;
let langCache: { value: ItemLang; expiresAt: number } | undefined;
const ownerNameCache = new Map<
    string,
    { name: string | null; expiresAt: number }
>();

/** QuickShop のお店を全ページ取得する。途中のページで失敗したら、そこまでの分を返す */
async function fetchAllShops(): Promise<QuickShop[]> {
    const baseUrl = `${getServerUrl("main")}/api/v1/plugins/quickshop/shops`;
    const shops: QuickShop[] = [];
    let cursor: string | number | null | undefined;
    for (let page = 0; page < MAX_PAGES; page++) {
        const params = new URLSearchParams({ limit: String(PAGE_LIMIT) });
        if (cursor !== undefined && cursor !== null) {
            params.set("cursor", String(cursor));
        }
        const response = await fetch(`${baseUrl}?${params}`, {
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        }).catch((error: unknown) => error);
        if (!(response instanceof Response) || !response.ok) {
            // 1 ページ目が取れなければ一覧そのものを出せない
            if (page === 0) {
                throw new Error(
                    `お店の一覧を取得できません: ${response instanceof Response ? response.status : String(response)}`,
                );
            }
            // 2 ページ目以降の失敗は、取れた分だけで一覧を出す
            console.warn(
                `お店の一覧の ${page + 1} ページ目を取得できません (${shops.length} 件で打ち切り):`,
                response instanceof Response ? response.status : response,
            );
            return shops;
        }
        const data = quickShopPageSchema.parse(await response.json());
        shops.push(...data.shops);
        if (!data.hasMore || data.nextCursor == null) {
            return shops;
        }
        cursor = data.nextCursor;
    }
    console.warn(
        `お店の一覧が ${MAX_PAGES} ページを超えたため ${shops.length} 件で打ち切りました`,
    );
    return shops;
}

/** お店の一覧 (isolate 内で短時間キャッシュする) */
export async function getAllShops(): Promise<QuickShop[]> {
    const now = Date.now();
    if (shopsCache && shopsCache.expiresAt > now) {
        return shopsCache.value;
    }
    const value = await fetchAllShops();
    // 失敗はキャッシュせず、次のリクエストで取り直す
    shopsCache = { value, expiresAt: now + SHOPS_CACHE_TTL_MS };
    return value;
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

const mcApiPlayerSchema = z.object({ name: z.string().min(1) });

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
    return parsed.success ? parsed.data.name : null;
}

/**
 * 持ち主の UUID → プレイヤー名の対応を作る。
 * キャッシュに無いものだけを上限つきで引き、引けなかったものは対応に含めない
 */
export async function resolveOwnerNames(
    uuids: readonly string[],
): Promise<Map<string, string>> {
    const now = Date.now();
    const names = new Map<string, string>();
    const pending: string[] = [];
    for (const uuid of new Set(uuids)) {
        const cached = ownerNameCache.get(uuid);
        if (cached && cached.expiresAt > now) {
            if (cached.name) {
                names.set(uuid, cached.name);
            }
        } else {
            pending.push(uuid);
        }
    }
    if (pending.length > MAX_OWNER_LOOKUPS) {
        // 残りは次のリクエストで引く (それまでは UUID の先頭で表示する)
        console.warn(
            `持ち主の名前を ${MAX_OWNER_LOOKUPS} 件だけ引き、${pending.length - MAX_OWNER_LOOKUPS} 件は次回に回します`,
        );
    }
    const queue = pending.slice(0, MAX_OWNER_LOOKUPS);
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
                if (name) {
                    names.set(uuid, name);
                }
            } catch (error) {
                // 通信の失敗はキャッシュせず、次のリクエストで引き直す
                console.warn(`持ち主 ${uuid} の名前を引けません:`, error);
            }
        }
    };
    await Promise.all(Array.from({ length: OWNER_LOOKUP_CONCURRENCY }, worker));
    return names;
}
