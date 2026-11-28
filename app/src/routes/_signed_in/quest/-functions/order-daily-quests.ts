import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { authMiddleware } from "../../../../lib/auth-middleware";
import { MINEAUTH_MUTATION_TIMEOUT_MS } from "../../../../lib/mineauth-timeout";
import {
    ORDERABLE_DIFFICULTIES,
    type QuestActionResult,
} from "../-types/quest";
import {
    getQuestAccessToken,
    questApiUrl,
    toQuestActionResult,
} from "./quest-api";
import { UNREACHABLE_MESSAGE } from "./quest-messages";

const orderInputSchema = z.object({
    difficulty: z.enum(ORDERABLE_DIFFICULTIES),
});

/**
 * 難易度を選んで、その日のデイリークエストを受ける。
 * ゲーム内で受付嬢に頼んだときと同じく、サーバーにいて、まだ受けていないときだけ受けられる
 */
export const orderDailyQuests = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(orderInputSchema)
    .handler(async ({ data }): Promise<QuestActionResult> => {
        try {
            const accessToken = await getQuestAccessToken(getRequest().headers);
            if (!accessToken) {
                return {
                    ok: false,
                    message: "ログインを確かめられませんでした",
                };
            }
            const response = await fetch(questApiUrl("/select"), {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ difficulty: data.difficulty }),
                signal: AbortSignal.timeout(MINEAUTH_MUTATION_TIMEOUT_MS),
            });
            return await toQuestActionResult(response, {
                // 登録数が足りず修復されたとき。ゲーム内でも受け直してもらう
                notMet: "クエストを受けられませんでした。もう一度ためしてください",
                conflict: "きょうのクエストはもう受けています",
            });
        } catch (error) {
            console.warn("デイリークエストを受けられません:", error);
            return { ok: false, message: UNREACHABLE_MESSAGE };
        }
    });
