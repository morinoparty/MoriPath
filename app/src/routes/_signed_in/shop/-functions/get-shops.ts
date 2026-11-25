import { createServerFn } from "@tanstack/react-start";
import type { QuickShop, ShopListing } from "../-types/shop";
import { sortShops } from "./filter-shops";
import type { ItemLang } from "./item-name";
import {
    fetchFirstShopPage,
    getAllShops,
    getItemLang,
    peekShopSnapshot,
    resolveOwnerNames,
    type ResolveOwnerNamesOptions,
} from "./quickshop-api";
import { toShopListing } from "./to-shop-listing";

/** getInitialShops の結果。最初の画面を出すための一覧 */
export interface InitialShops {
    /** 在庫のあるお店が先に並んだ一覧 */
    shops: ShopListing[];
    /** すべてのお店がそろっているか。false なら 1 ページ目だけで、残りは getShops で取る */
    complete: boolean;
    /** 一覧を API から取った時刻 (ms) */
    fetchedAt: number;
}

// 最初の画面では名前を待たない。お店は 1 ページ分しか取らないため、引く数には余裕がある
const INITIAL_OWNER_LOOKUP: ResolveOwnerNamesOptions = {
    maxLookups: 40,
    waitMs: 0,
};
// 残りのお店を待つあいだは少しだけ名前も待つ。全ページを取り直す場合に備え、引く数は抑える
const FULL_OWNER_LOOKUP: ResolveOwnerNamesOptions = {
    maxLookups: 25,
    waitMs: 800,
};

/** API のお店を画面用の形にし、持ち主の名前を入れて並べる */
async function toListings(
    shops: readonly QuickShop[],
    lang: ItemLang | null,
    ownerLookup: ResolveOwnerNamesOptions,
): Promise<ShopListing[]> {
    const listings = shops.map((shop) => toShopListing(shop, lang));
    const ownerNames = await resolveOwnerNames(
        listings.flatMap((shop) => (shop.owner ? [shop.owner.id] : [])),
        ownerLookup,
    );
    return sortShops(
        listings.map((shop) =>
            shop.owner
                ? {
                      ...shop,
                      owner: {
                          ...shop.owner,
                          name:
                              ownerNames.get(shop.owner.id) ?? shop.owner.name,
                      },
                  }
                : shop,
        ),
    );
}

/**
 * 最初の画面に出すお店。キャッシュ済みの一覧があればそれを (古くなりかけでも) すべて返し、
 * 無ければ API の 1 ページ目だけを返す。一覧は公開 API なのでログイン情報は使わない
 */
export const getInitialShops = createServerFn().handler(
    async (): Promise<InitialShops> => {
        // アイテム名の辞書は失敗しても null になるため、一覧と並行して取る
        const langPromise = getItemLang();
        const snapshot = await peekShopSnapshot();
        if (snapshot) {
            return {
                shops: await toListings(
                    snapshot.shops,
                    await langPromise,
                    INITIAL_OWNER_LOOKUP,
                ),
                complete: true,
                fetchedAt: snapshot.fetchedAt,
            };
        }
        const fetchedAt = Date.now();
        const [page, lang] = await Promise.all([
            fetchFirstShopPage(),
            langPromise,
        ]);
        return {
            shops: await toListings(page.shops, lang, INITIAL_OWNER_LOOKUP),
            complete: !page.hasMore,
            fetchedAt,
        };
    },
);

/**
 * QuickShop のお店をすべて、画面用の形にして返す (在庫のあるお店が先)。
 * 一覧は公開 API なのでログイン情報は使わない
 */
export const getShops = createServerFn().handler(
    async (): Promise<ShopListing[]> => {
        const [snapshot, lang] = await Promise.all([
            getAllShops(),
            getItemLang(),
        ]);
        return toListings(snapshot.shops, lang, FULL_OWNER_LOOKUP);
    },
);
