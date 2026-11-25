import { z } from "zod";
import { worldIds } from "../-types/world-map";

// /map の URL 検索パラメータ。共有した URL で同じ場所を開けるよう、ワールドと座標を持つ
export const mapSearchSchema = z.object({
    // 不正な値は既定のワールドに戻す
    world: z.enum(worldIds).catch("minecraft_overworld"),
    // 座標は両方そろったときだけ使う。数値でなければ無視する
    x: z.coerce.number().int().optional().catch(undefined),
    z: z.coerce.number().int().optional().catch(undefined),
});

export type MapSearch = z.infer<typeof mapSearchSchema>;
