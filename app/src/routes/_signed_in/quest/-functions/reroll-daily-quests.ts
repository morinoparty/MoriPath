import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { authMiddleware } from "../../../../lib/auth-middleware";
import { MINEAUTH_MUTATION_TIMEOUT_MS } from "../../../../lib/mineauth-timeout";
import type { QuestActionResult } from "../-types/quest";
import {
    getQuestAccessToken,
    questApiUrl,
    toQuestActionResult,
} from "./quest-api";
import { UNREACHABLE_MESSAGE } from "./quest-messages";

/**
 * いま受けているデイリークエストを手放し、難易度を選び直せるようにする (リロール)。
 * 残り回数が無いときや、目標を達成したクエストがあるときはプラグイン側で断られる
 */
export const rerollDailyQuests = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .handler(async (): Promise<QuestActionResult> => {
        try {
            const accessToken = await getQuestAccessToken(getRequest().headers);
            if (!accessToken) {
                return {
                    ok: false,
                    message: "ログインを確かめられませんでした",
                };
            }
            const response = await fetch(questApiUrl("/reroll"), {
                method: "POST",
                headers: { Authorization: `Bearer ${accessToken}` },
                signal: AbortSignal.timeout(MINEAUTH_MUTATION_TIMEOUT_MS),
            });
            return await toQuestActionResult(response, {
                notMet: "いまはリロールできません",
            });
        } catch (error) {
            console.warn("デイリークエストをリロールできません:", error);
            return { ok: false, message: UNREACHABLE_MESSAGE };
        }
    });
