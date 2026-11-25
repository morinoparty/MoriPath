import type { ShopListing, ShopMode } from "../-types/shop";

// これ以上の値段は実質「売る気のない」設定なので、桁を並べずに ∞ と出す
const UNREASONABLE_PRICE = 1e12;

const priceFormat = new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: 2,
});
// 100 万を超える値段は「120万」のように縮めて行に収める
const compactPriceFormat = new Intl.NumberFormat("ja-JP", {
    notation: "compact",
    maximumFractionDigits: 1,
});

/** 値段 (どんぐり) を表示用の文字列にする */
export const formatPrice = (price: number): string => {
    if (price >= UNREASONABLE_PRICE) {
        return "∞";
    }
    if (price >= 1_000_000) {
        return compactPriceFormat.format(price);
    }
    return priceFormat.format(price);
};

/** お店の向きの表示名 */
export const shopModeLabels: Record<ShopMode, string> = {
    SELL: "売っている",
    BUY: "買い取り",
};

/** 在庫の見出し。買い取りのお店では「あと何個買い取れるか」を表す */
export const stockHeading = (mode: ShopMode): string =>
    mode === "SELL" ? "在庫" : "買い取り枠";

/** 一覧の右下に出す在庫の一言 */
export const stockLabel = (shop: ShopListing): string => {
    if (shop.stock === null) {
        return `${stockHeading(shop.mode)} ∞`;
    }
    if (shop.stock > 0) {
        return `${stockHeading(shop.mode)} ${shop.stock.toLocaleString("ja-JP")}`;
    }
    // 買い取りのお店は空きが無くなったら受付終了
    return shop.mode === "SELL" ? "売り切れ" : "受付終了";
};

/** 「Cobblestone ×64」のような、アイテム名と 1 取引の個数 */
export const itemWithAmount = (shop: ShopListing): string =>
    `${shop.itemName} ×${shop.amount}`;

/** 「-5179, 75, -8597」のような座標 */
export const formatCoordinates = ({
    x,
    y,
    z,
}: ShopListing["location"]): string => `${x}, ${y}, ${z}`;
