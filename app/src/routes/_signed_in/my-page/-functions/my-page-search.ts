import { z } from "zod";
import { PORTRAIT_POSE_IDS } from "./portrait-pose";

// /my-page の URL 検索パラメータ。選ぶ UI は置かず、URL を直接書いたときだけ使う
export const myPageSearchSchema = z.object({
    // ?pose=front|diagonal|pickaxe|torch|wave でポートレートのポーズを固定する。
    // 省略したときや読めない値はこれまでどおり表示のたびにランダムに選ぶ (URL は書き換えない)
    pose: z.enum(PORTRAIT_POSE_IDS).optional().catch(undefined),
});
