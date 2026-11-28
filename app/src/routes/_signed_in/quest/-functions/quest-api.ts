import { z } from "zod";
import { getMineAuthAccessToken } from "../../../../lib/auth";
import { getServerUrl } from "../../../../lib/server-list";
import type { QuestActionResult } from "../-types/quest";
import { OFFLINE_MESSAGE, UNREACHABLE_MESSAGE } from "./quest-messages";

// デイリークエストのプラグイン (BetonQuest-daily-MineAuth-integration) は資源サーバーにだけ入っている
const QUEST_SERVER = "res";

/** 自分のデイリークエストの API の URL。path は "/select" などの続き */
export const questApiUrl = (path = ""): string =>
    `${getServerUrl(QUEST_SERVER)}/api/v1/plugins/dailyquest/daily-quests/me${path}`;

/** リクエストのクッキーから MineAuth のアクセストークンを取る。取れなければ null */
export const getQuestAccessToken = async (
    headers: Headers,
): Promise<string | null> => {
    const tokenResult = await getMineAuthAccessToken(headers);
    return tokenResult?.accessToken ?? null;
};

// 受注・リロールの API の応答 (条件を満たさず実行されなかったときは success: false)
const actionResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});

// 失敗時の本文。プラグインは理由を code で返す
const errorBodySchema = z.object({
    code: z.string().nullish(),
});

/** 失敗時の本文から code を取り出す。読めなければ null */
const readErrorCode = async (response: Response): Promise<string | null> => {
    try {
        const parsed = errorBodySchema.safeParse(await response.json());
        return parsed.success ? (parsed.data.code ?? null) : null;
    } catch {
        return null;
    }
};

interface ActionMessages {
    /** 条件を満たさず実行されなかったとき */
    notMet: string;
    /** 409 で断られたとき */
    conflict?: string;
}

/** 受注・リロールの応答を、画面に出す結果に変える */
export const toQuestActionResult = async (
    response: Response,
    messages: ActionMessages,
): Promise<QuestActionResult> => {
    if (response.ok) {
        const parsed = actionResponseSchema.safeParse(await response.json());
        if (!parsed.success) {
            return { ok: false, message: UNREACHABLE_MESSAGE };
        }
        return parsed.data.success
            ? { ok: true }
            : { ok: false, message: messages.notMet };
    }
    const code = await readErrorCode(response);
    if (code === "player_offline") {
        return { ok: false, message: OFFLINE_MESSAGE };
    }
    if (response.status === 409 && messages.conflict) {
        return { ok: false, message: messages.conflict };
    }
    console.warn(`デイリークエストの操作に失敗しました: ${response.status}`);
    return { ok: false, message: UNREACHABLE_MESSAGE };
};
