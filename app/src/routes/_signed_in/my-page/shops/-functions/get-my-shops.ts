import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAuth } from "../../../../../lib/auth";
import { getServerUrl } from "../../../../../lib/server-list";
import { sortShops } from "../../../shop/-functions/filter-shops";
import {
    getAllShops,
    getItemLang,
    peekShopSnapshot,
} from "../../../shop/-functions/quickshop-api";
import { toShopListing } from "../../../shop/-functions/to-shop-listing";
import {
    type QuickShop,
    quickShopSchema,
    type ShopListing,
} from "../../../shop/-types/shop";

// 外部 API が遅いときにページ全体を待たせない
const FETCH_TIMEOUT_MS = 5000;
// 一覧に無かったお店を 1 件ずつ引く上限。Workers のサブリクエスト数に余裕を残す
const MAX_SHOP_LOOKUPS = 20;
// キャッシュに一覧が無いとき、これより多ければ 1 件ずつではなく全体を取る。
// API は同時に 4 件ほどしかさばけないため、これを超えると区間に分けた全体の取得と変わらない
const PER_SHOP_LOOKUP_LIMIT = 8;

// GET /api/v1/plugins/quickshop/users/{player}/shops の応答。
// spec ではお店の ID の配列だが、お店そのものを返す形に変わっても読めるようにしておく
const myShopsResponseSchema = z.array(z.union([z.number(), quickShopSchema]));

/** ログイン中のプレイヤーのお店 (ID、またはお店そのもの) を MineAuth から取る */
async function fetchMyShopRefs(
    headers: Headers,
): Promise<Array<number | QuickShop>> {
    const auth = await getAuth();
    const tokenResult = await auth.api.getAccessToken({
        body: { useAccountCookie: true },
        headers,
    });
    if (!tokenResult?.accessToken) {
        throw new Error("No access token available");
    }
    const response = await fetch(
        `${getServerUrl("main")}/api/v1/plugins/quickshop/users/me/shops`,
        {
            headers: { Authorization: `Bearer ${tokenResult.accessToken}` },
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        },
    );
    if (!response.ok) {
        throw new Error(`Failed to fetch my shops: ${response.status}`);
    }
    return myShopsResponseSchema.parse(await response.json());
}

/** お店を 1 件引く (公開 API)。取れなければ null */
async function fetchShop(shopId: number): Promise<QuickShop | null> {
    try {
        const response = await fetch(
            `${getServerUrl("main")}/api/v1/plugins/quickshop/shops/${shopId}`,
            { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) },
        );
        if (!response.ok) {
            return null;
        }
        return quickShopSchema.parse(await response.json());
    } catch (error) {
        console.warn(`お店 ${shopId} を取得できません:`, error);
        return null;
    }
}

/**
 * ID からお店を集める。まず使い回している全体の一覧から探し、無いものだけを 1 件ずつ引く。
 * 全体の一覧を取り直すと数ページ分待つため、キャッシュに無いときは 1 件ずつ並行に引き、
 * 1 件ずつでは引ききれない数のときだけ全体を取る
 */
async function resolveShops(shopIds: readonly number[]): Promise<QuickShop[]> {
    if (shopIds.length === 0) {
        return [];
    }
    const snapshot =
        (await peekShopSnapshot()) ??
        (shopIds.length > PER_SHOP_LOOKUP_LIMIT
            ? // 全体の一覧が取れなくても、1 件ずつ引く方で補う
              await getAllShops().catch(() => undefined)
            : undefined);
    const allShops = snapshot?.shops ?? [];
    const byId = new Map(allShops.map((shop) => [shop.shopId, shop]));
    const found = shopIds.flatMap((id) => {
        const shop = byId.get(id);
        return shop ? [shop] : [];
    });
    const missing = shopIds.filter((id) => !byId.has(id));
    if (missing.length > MAX_SHOP_LOOKUPS) {
        console.warn(
            `一覧に無いお店を ${MAX_SHOP_LOOKUPS} 件だけ引き、${missing.length - MAX_SHOP_LOOKUPS} 件は省きます`,
        );
    }
    const fetched = await Promise.all(
        missing.slice(0, MAX_SHOP_LOOKUPS).map(fetchShop),
    );
    return [...found, ...fetched.filter((shop) => shop !== null)];
}

/**
 * ログイン中のプレイヤーのお店を、画面用の形にして返す (在庫のあるお店が先)。
 * 持ち主はすべて本人なので、名前は呼び出し側でセッションの名前に置き換える
 */
export const getMyShops = createServerFn().handler(
    // oxlint-disable-next-line typescript/no-explicit-any -- request is not typed
    async ({ request }: any): Promise<ShopListing[]> => {
        // アイテム名の辞書は失敗しても null になるため、お店の取得と並行して取る
        const [refs, lang] = await Promise.all([
            fetchMyShopRefs(request.headers),
            getItemLang(),
        ]);
        const shopIds = refs.filter((ref) => typeof ref === "number");
        const inlineShops = refs.filter((ref) => typeof ref !== "number");
        const shops = [...inlineShops, ...(await resolveShops(shopIds))];
        return sortShops(shops.map((shop) => toShopListing(shop, lang)));
    },
);
