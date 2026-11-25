import { toWorldId } from "../../map/-functions/world-id";
import type { QuickShop, ShopListing } from "../-types/shop";
import { type ItemLang, toItemName } from "./item-name";

/** 在庫を、無限 (null)・分からない (undefined)・個数に読み分ける */
const toStock = (shop: QuickShop): number | null | undefined => {
    // 新しい API は unlimited で、古い API は -1 などの負の値で無限ショップを表す
    if (shop.unlimited === true || (shop.remaining ?? 0) < 0) {
        return null;
    }
    // 新しい API では、在庫を数えられないお店の remaining が null になる
    return shop.remaining ?? undefined;
};

/** API のお店を画面用の形にする。持ち主の名前はまだ引かない */
export const toShopListing = (
    shop: QuickShop,
    lang: ItemLang | null,
): ShopListing => {
    const stock = toStock(shop);
    return {
        id: shop.shopId,
        mode: shop.mode,
        // MinecraftItem はアイテム ID を小文字で受け取る
        itemId: shop.item.type.name.toLowerCase(),
        itemName: toItemName(
            shop.item.type.name,
            shop.item.meta?.displayName?.text,
            lang,
        ),
        amount: shop.item.amount,
        price: shop.price,
        stock: stock ?? null,
        // 分からない在庫を無限と取り違えないよう、null とは別に印を付ける
        ...(stock === undefined && { stockUnknown: true }),
        // 名前は画面で mc-api からまとめて引くので、ここでは UUID だけを持つ
        owner: shop.owner ? { id: shop.owner, name: null } : null,
        location: {
            world: shop.location.world,
            worldId: toWorldId(shop.location.world),
            // /map の座標は整数で受け取るため、ブロック座標に丸める
            x: Math.floor(shop.location.x),
            y: Math.floor(shop.location.y),
            z: Math.floor(shop.location.z),
        },
    };
};
