import type { WorldId } from "../../map/-types/world-map";
import type { QuickShop, ShopListing } from "../-types/shop";
import { type ItemLang, toItemName } from "./item-name";

// サーバー上のワールド名 → squaremap のワールド ID
const worldIdByName: Record<string, WorldId> = {
    world: "minecraft_overworld",
    world_nether: "minecraft_the_nether",
    world_the_end: "minecraft_the_end",
};

/** サーバー上のワールド名を /map のワールド ID にする。知らないワールドなら null */
export const toWorldId = (world: string): WorldId | null =>
    worldIdByName[world] ?? null;

/** UUID の先頭 8 文字。名前を引けなかった持ち主の仮の名前に使う */
export const shortUuid = (uuid: string): string => uuid.slice(0, 8);

/** API のお店を画面用の形にする。持ち主の名前はまだ引かず、UUID の先頭を仮に入れておく */
export const toShopListing = (
    shop: QuickShop,
    lang: ItemLang | null,
): ShopListing => ({
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
    // -1 などの負の値は無限ショップの印
    stock: shop.remaining < 0 ? null : shop.remaining,
    owner: shop.owner ? { id: shop.owner, name: shortUuid(shop.owner) } : null,
    location: {
        world: shop.location.world,
        worldId: toWorldId(shop.location.world),
        // /map の座標は整数で受け取るため、ブロック座標に丸める
        x: Math.floor(shop.location.x),
        y: Math.floor(shop.location.y),
        z: Math.floor(shop.location.z),
    },
});
