import { z } from "zod";
import type { WorldId } from "../../map/-types/world-map";

// QuickShop の取引の向き。SELL = お店が売る (売っている) / BUY = お店が買い取る (買い取り)
export const shopModes = ["SELL", "BUY"] as const;
export type ShopMode = (typeof shopModes)[number];

/** GET /api/v1/plugins/quickshop/shops の 1 件。実データに合わせて任意項目を緩めている */
export const quickShopSchema = z.object({
    shopId: z.number(),
    // 運営の無限ショップは owner を持たない
    owner: z.string().nullish(),
    mode: z.enum(shopModes),
    stackingAmount: z.number(),
    // 在庫 (買い取りなら空き)。古い API は無限ショップを -1 で返す。
    // 新しい API (MineAuth 0.7.1〜) は数えられない在庫でキー自体を省く (explicitNulls = false) ので、null と省略の両方を受ける
    remaining: z.number().nullish(),
    // 新しい API で無限ショップを表す。古い API には無い
    unlimited: z.boolean().optional(),
    location: z.object({
        world: z.string(),
        x: z.number(),
        y: z.number(),
        z: z.number(),
    }),
    // 1 取引 (item.amount 個) あたりの値段。小数を含む
    price: z.number(),
    item: z.object({
        type: z.object({
            name: z.string(),
            type: z.string(),
        }),
        amount: z.number(),
        meta: z
            .object({
                displayName: z.object({ text: z.string() }).nullish(),
            })
            .nullish(),
    }),
});

export type QuickShop = z.infer<typeof quickShopSchema>;

/** ショップ一覧のページ */
export const quickShopPageSchema = z.object({
    shops: z.array(quickShopSchema),
    // spec では string、実データでは数値で返ってくる
    nextCursor: z.union([z.string(), z.number()]).nullish(),
    hasMore: z.boolean(),
});

/** お店の持ち主 */
export interface ShopOwner {
    /** Minecraft の UUID */
    id: string;
    /** プレイヤー名。引けなければ UUID の先頭 */
    name: string;
}

/** 画面に出すお店 1 件。API の形から表示に要るものだけを抜き出したもの */
export interface ShopListing {
    id: number;
    mode: ShopMode;
    /** Minecraft のアイテム ID (小文字。例: "cobblestone") */
    itemId: string;
    /** 表示名 (アイテムの名前、または付けられた名前) */
    itemName: string;
    /** 1 取引の個数 */
    amount: number;
    /** 1 取引の値段 (どんぐり) */
    price: number;
    /** 在庫 (買い取りなら空き)。無限、または分からなければ null */
    stock: number | null;
    /** 在庫の数が分からない (API が数を返さなかった) ときだけ true */
    stockUnknown?: boolean;
    /** 持ち主。運営のお店なら null */
    owner: ShopOwner | null;
    location: {
        /** サーバー上のワールド名 (例: "world") */
        world: string;
        /** /map のワールド ID。対応するワールドが無ければ null */
        worldId: WorldId | null;
        x: number;
        y: number;
        z: number;
    };
}

/** 一覧の絞り込み。all = すべて / sell = 売っている / buy = 買い取り */
export const shopFilters = ["all", "sell", "buy"] as const;
export type ShopFilter = (typeof shopFilters)[number];

/** getShops が返す 1 ページ分 */
export interface ShopPage {
    shops: ShopListing[];
    /** 絞り込み後の全件数 */
    total: number;
    /** 次のページの開始位置。最後のページなら null */
    nextOffset: number | null;
}
