import { z } from "zod";
import { shopFilters } from "../-types/shop";

// /shop の URL 検索パラメータ。共有した URL で同じ絞り込みを開けるよう、検索語とチップを持つ
export const shopSearchSchema = z.object({
    // 空の検索語は URL に残さない
    q: z.string().trim().max(64).optional().catch(undefined),
    // 不正な値は「すべて」に戻す
    mode: z.enum(shopFilters).optional().catch(undefined),
});

export type ShopSearch = z.infer<typeof shopSearchSchema>;
