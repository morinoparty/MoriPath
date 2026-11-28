import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { authMiddleware } from "../../../../lib/auth-middleware";
import { MINEAUTH_API_TIMEOUT_MS } from "../../../../lib/mineauth-timeout";
import { dailyQuestResponseSchema, type QuestBoard } from "../-types/quest";
import { getQuestAccessToken, questApiUrl } from "./quest-api";
import { toQuestBoard } from "./to-quest-board";

/**
 * その日のデイリークエストの状況を取る。
 * 取得できないとき (プラグインが古い・サーバーが止まっているなど) は null を返し、画面で知らせる
 */
export const getQuestBoard = createServerFn()
    // RPC として直接呼べるため、ここでもサインインを確かめる
    .middleware([authMiddleware])
    .handler(async (): Promise<QuestBoard | null> => {
        try {
            const accessToken = await getQuestAccessToken(getRequest().headers);
            if (!accessToken) {
                return null;
            }
            const response = await fetch(questApiUrl(), {
                headers: { Authorization: `Bearer ${accessToken}` },
                signal: AbortSignal.timeout(MINEAUTH_API_TIMEOUT_MS),
            });
            if (!response.ok) {
                console.warn(
                    `デイリークエストの取得に失敗しました: ${response.status}`,
                );
                return null;
            }
            // 想定外の形なら parse で例外にして null を返す
            return toQuestBoard(
                dailyQuestResponseSchema.parse(await response.json()),
            );
        } catch (error) {
            console.warn("デイリークエストを取得できません:", error);
            return null;
        }
    });
