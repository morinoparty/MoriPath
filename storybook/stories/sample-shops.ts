import type { ShopListing } from "@/routes/_signed_in/shop/-types/shop";
import { samplePlayers } from "./sample-players";

/**
 * Storybook ではアセットの配信元をリポジトリに書かないため、
 * STORYBOOK_MC_ASSETS_URL (例: <MC_ASSETS_URL>/assets/minecraft) があるときだけアイテムを描く
 */
export const sampleMinecraftAssetsUrl: string | undefined =
    import.meta.env.STORYBOOK_MC_ASSETS_URL || undefined;

// 座標とワールドは共通で、お店ごとに少しずつずらす
const location = (x: number, y: number, z: number) => ({
    world: "world",
    worldId: "minecraft_overworld" as const,
    x,
    y,
    z,
});

/** Figma の /shop と同じ並びのお店 */
export const sampleShops = {
    diamond: {
        id: 1,
        mode: "SELL",
        itemId: "diamond",
        itemName: "Diamond",
        amount: 1,
        price: 80,
        stock: 6,
        owner: samplePlayers.nikomaru,
        location: location(-5179, 75, -8597),
    },
    cobblestone: {
        id: 2,
        mode: "SELL",
        itemId: "cobblestone",
        itemName: "Cobblestone",
        amount: 64,
        price: 1,
        stock: 128,
        owner: samplePlayers.chocolatt,
        location: location(-5181, 75, -8597),
    },
    oakLog: {
        id: 3,
        mode: "SELL",
        itemId: "oak_log",
        itemName: "Oak Log",
        amount: 16,
        price: 12,
        stock: 40,
        owner: samplePlayers.kina1120,
        location: location(-5183, 75, -8597),
    },
    ironIngot: {
        id: 4,
        mode: "BUY",
        itemId: "iron_ingot",
        itemName: "Iron Ingot",
        amount: 4,
        price: 20,
        stock: 9,
        owner: samplePlayers.hikighaL,
        location: location(-5185, 75, -8597),
    },
    cookedBeef: {
        id: 5,
        mode: "SELL",
        itemId: "cooked_beef",
        itemName: "Cooked Beef",
        amount: 16,
        price: 10,
        stock: 3,
        owner: samplePlayers.chocolatt,
        location: location(-5187, 75, -8597),
    },
    // 在庫の無いお店は一覧の後ろに沈む
    bread: {
        id: 6,
        mode: "SELL",
        itemId: "bread",
        itemName: "Bread",
        amount: 8,
        price: 4,
        stock: 0,
        owner: samplePlayers.tututututu201,
        location: location(-5189, 75, -8597),
    },
    // 運営の無限ショップ (持ち主なし・在庫無限)
    minecart: {
        id: 7,
        mode: "SELL",
        itemId: "minecart",
        itemName: "Minecart",
        amount: 1,
        price: 10,
        stock: null,
        owner: null,
        location: location(-5100, 70, -8500),
    },
    // ネザーにある、名前の付いたアイテム
    namedFirework: {
        id: 8,
        mode: "SELL",
        itemId: "firework_rocket",
        itemName: "冬暖花火・雪",
        amount: 3,
        price: 1.5,
        stock: 12,
        owner: samplePlayers.nikomaru,
        location: {
            world: "world_nether",
            worldId: "minecraft_the_nether",
            x: -640,
            y: 64,
            z: -1072,
        },
    },
} satisfies Record<string, ShopListing>;

/** 一覧の表示順 (在庫のあるお店が先) */
export const sampleShopList: ShopListing[] = [
    sampleShops.diamond,
    sampleShops.cobblestone,
    sampleShops.oakLog,
    sampleShops.ironIngot,
    sampleShops.cookedBeef,
    sampleShops.minecart,
    sampleShops.namedFirework,
    sampleShops.bread,
];
