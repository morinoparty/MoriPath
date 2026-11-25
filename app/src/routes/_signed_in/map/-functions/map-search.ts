import { z } from "zod";
import { worldIds } from "../-types/world-map";
import {
    MAP_COORD_LIMIT,
    normalizeMapPinLabel,
    parseMapPin,
} from "./map-pin-param";

// 座標は両方そろったときだけ使う。整数でない・ワールドの外なら無視する
const coordSchema = z.coerce
    .number()
    .int()
    .min(-MAP_COORD_LIMIT)
    .max(MAP_COORD_LIMIT)
    .optional()
    .catch(undefined);

// /map の URL 検索パラメータ。共有した URL で同じ場所を開けるよう、ワールドと座標を持つ
export const mapSearchSchema = z.object({
    // 不正な値は既定のワールドに戻す
    world: z.enum(worldIds).catch("minecraft_overworld"),
    // 地図の中心だけを決める座標 (目印は出さない)。ピンを外したあとも同じ場所を見せるのに使う
    x: coordSchema,
    z: coordSchema,
    // 目印を立てる地点 (<種類>:<x>,<z>)。読めなければ無視する
    pin: z
        .string()
        .refine((value) => parseMapPin(value) !== null)
        .optional()
        .catch(undefined),
    // ピンに添える名前。ルーターが数字だけの値を数値にするので、文字列に戻してからそろえる
    label: z.coerce
        .string()
        .transform(normalizeMapPinLabel)
        .optional()
        .catch(undefined),
});

export type MapSearch = z.infer<typeof mapSearchSchema>;
