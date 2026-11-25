import { createServerFn } from "@tanstack/react-start";
import type { ShopListing } from "../-types/shop";
import { sortShops } from "./filter-shops";
import { getAllShops, getItemLang, resolveOwnerNames } from "./quickshop-api";
import { toShopListing } from "./to-shop-listing";

/**
 * QuickShop のお店をすべて、画面用の形にして返す (在庫のあるお店が先)。
 * 一覧は公開 API なのでログイン情報は使わない
 */
export const getShops = createServerFn().handler(
    async (): Promise<ShopListing[]> => {
        // アイテム名の辞書は失敗しても null になるため、一覧と並行して取る
        const [shops, lang] = await Promise.all([getAllShops(), getItemLang()]);
        const listings = shops.map((shop) => toShopListing(shop, lang));
        const ownerNames = await resolveOwnerNames(
            listings.flatMap((shop) => (shop.owner ? [shop.owner.id] : [])),
        );
        return sortShops(
            listings.map((shop) =>
                shop.owner
                    ? {
                          ...shop,
                          owner: {
                              ...shop.owner,
                              name:
                                  ownerNames.get(shop.owner.id) ??
                                  shop.owner.name,
                          },
                      }
                    : shop,
            ),
        );
    },
);
