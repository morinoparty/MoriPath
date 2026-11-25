import { z } from "zod";

/** 返信の最大文字数。moripautils の TicketService.MAX_CONTENT_LENGTH に合わせる */
export const MAX_COMMENT_LENGTH = 1000;

/** 返信の本文。前後の空白を除いて 1 文字以上、上限以下 (API も同じ規則で確かめる) */
export const commentContentSchema = z
    .string()
    .trim()
    .min(1, "本文を入力してください")
    .max(MAX_COMMENT_LENGTH, `${MAX_COMMENT_LENGTH}文字までです`);

/** 返信のサーバー関数に渡す値 */
export const addTicketCommentInputSchema = z.object({
    ticketId: z.number().int().positive(),
    content: commentContentSchema,
});

export type AddTicketCommentInput = z.infer<typeof addTicketCommentInputSchema>;

/** 入力中の本文が送れる形か (送るボタンを押せるか) */
export const isSendableComment = (content: string): boolean =>
    commentContentSchema.safeParse(content).success;
