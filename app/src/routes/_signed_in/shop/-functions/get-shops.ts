import { createServerFn } from "@tanstack/react-start";
import type { QuickShop, ShopListing } from "../-types/shop";
import { sortShops } from "./filter-shops";
import type { ItemLang } from "./item-name";
import { getAllShops, getItemLang } from "./quickshop-api";
import { toShopListing } from "./to-shop-listing";

/**
 * API のお店を画面用の形にして並べる。持ち主の名前はブラウザが表示する行の分だけ引くため、
 * ここでは UUID の先頭を仮の名前に入れたまま返す
 */
const toListings = (
    shops: readonly QuickShop[],
    lang: ItemLang | null,
): ShopListing[] => sortShops(shops.map((shop) => toShopListing(shop, lang)));

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
