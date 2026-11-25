import { createServerFn } from "@tanstack/react-start";
import type { QuickShop, ShopListing } from "../-types/shop";
import { sortShops } from "./filter-shops";
import type { ItemLang } from "./item-name";
import {
    fetchFirstShopPage,
    getAllShops,
    getItemLang,
    peekShopSnapshot,
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

/**
 * API のお店を画面用の形にして並べる。持ち主の名前はブラウザが表示する行の分だけ引くため、
 * ここでは UUID の先頭を仮の名前に入れたまま返す
 */
const toListings = (
    shops: readonly QuickShop[],
    lang: ItemLang | null,
): ShopListing[] => sortShops(shops.map((shop) => toShopListing(shop, lang)));

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
                shops: toListings(snapshot.shops, await langPromise),
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
            shops: toListings(page.shops, lang),
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
        return toListings(snapshot.shops, lang);
    },
);
