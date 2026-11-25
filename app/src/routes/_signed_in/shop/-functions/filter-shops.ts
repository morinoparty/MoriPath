import type { ShopFilter, ShopListing } from "../-types/shop";

/** 在庫があるか (無限ショップは常にある。数の分からないお店も売り切れとは扱わない) */
export const isInStock = (shop: ShopListing): boolean =>
    shop.stock === null || shop.stock > 0;

// 絞り込みチップとお店の向きの対応
const modeByFilter = {
    sell: "SELL",
    buy: "BUY",
} as const;

/** 検索語と絞り込みチップで一覧を絞り込む */
export const filterShops = (
    shops: readonly ShopListing[],
    query: string,
    filter: ShopFilter,
): ShopListing[] => {
    // 大文字小文字や前後の空白の違いで取りこぼさないよう正規化する
    const needle = query.trim().toLowerCase();
    return shops.filter((shop) => {
        if (filter !== "all" && shop.mode !== modeByFilter[filter]) {
            return false;
        }
        if (!needle) {
            return true;
        }
        // 表示名に加えて、"oak_log" のような ID や "oak log" でも引けるようにする
        return (
            shop.itemName.toLowerCase().includes(needle) ||
            shop.itemId.includes(needle) ||
            shop.itemId.replaceAll("_", " ").includes(needle)
        );
    });
};

/** 在庫のあるお店を先に、その中はアイテム名 → 値段の安い順に並べる */
export const sortShops = (shops: readonly ShopListing[]): ShopListing[] =>
    [...shops].sort(
        (a, b) =>
            Number(isInStock(b)) - Number(isInStock(a)) ||
            a.itemName.localeCompare(b.itemName, "ja") ||
            a.price - b.price ||
            a.id - b.id,
    );
