import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { AddTicketCommentResult } from "../-types/ticket";
import {
    type AddTicketCommentInput,
    addTicketCommentInputSchema,
    MAX_COMMENT_LENGTH,
} from "./comment-input";
import { getTicketApi } from "./ticket-api";

// API が断ったときの本文。code で理由を見分ける
const errorBodySchema = z.object({
    code: z.string().optional(),
    message: z.string().optional(),
});

// API の code ごとの案内
const ERROR_MESSAGES: Record<string, string> = {
    ticket_not_found: "このお問い合わせには返信できません",
    blank_content: "本文を入力してください",
    content_too_long: `${MAX_COMMENT_LENGTH}文字までです`,
};

const FALLBACK_MESSAGE = "送れませんでした。もう一度ためしてください";

/** 断られたときの本文から案内を選ぶ。読めなければ既定の案内 */
const readErrorMessage = async (response: Response): Promise<string> => {
    const parsed = errorBodySchema.safeParse(
        await response.json().catch(() => null),
    );
    const code = parsed.success ? parsed.data.code : undefined;
    return (code && ERROR_MESSAGES[code]) ?? FALLBACK_MESSAGE;
};

/**
 * 自分のお問い合わせに返信する。
 * 本人用の /me の API だけを使うため、他人のチケットには書き込めない (API が 404 で断る)
 */
export const addTicketComment = createServerFn({ method: "POST" })
    .validator(addTicketCommentInputSchema)
    .handler(
        // oxlint-disable-next-line typescript/no-explicit-any -- request は createServerFn のコンテキストで型が付かない
        async ({ data, request }: any): Promise<AddTicketCommentResult> => {
            // 前後の空白はスキーマで取り除き済み
            const { ticketId, content } = data as AddTicketCommentInput;
            const api = await getTicketApi((request as Request).headers);

            const response = await fetch(
                `${api.baseUrl}/me/tickets/${ticketId}/comments`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${api.accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ content }),
                },
            );
            if (response.ok) {
                return { ok: true };
            }
            console.warn("返信を送れませんでした:", response.status);
            return { ok: false, message: await readErrorMessage(response) };
        },
    );
