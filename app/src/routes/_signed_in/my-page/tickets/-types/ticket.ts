import { z } from "zod";

// --- MineAuth (moripautils) の API の応答 ---

// 送信時にいた場所。表示には使わないが、応答の形を確かめるために持つ
const ticketLocationSchema = z.object({
    world: z.string(),
    x: z.number(),
    y: z.number(),
    z: z.number(),
});

/** チケット 1 件 (GET /me/tickets の要素と GET /tickets/{id} の応答) */
export const ticketResponseSchema = z.object({
    id: z.number(),
    server: z.string(),
    playerUuid: z.string(),
    playerName: z.string(),
    location: ticketLocationSchema,
    categoryId: z.string(),
    // 設定からカテゴリーが消されていると null になる
    categoryName: z.string().nullish(),
    content: z.string(),
    // OPEN / CLOSED。将来ふえても読めるよう文字列のまま受ける
    status: z.string(),
    // ISO-8601 の UTC
    createdAt: z.string(),
    // done / not-planned / duplicate。オープン中は null
    closeReason: z.string().nullish(),
});

/** チケット一覧の 1 ページ (古い順。cursor の id より後を返す) */
export const ticketListResponseSchema = z.object({
    tickets: z.array(ticketResponseSchema),
    hasMore: z.boolean(),
    nextCursor: z.number().nullish(),
});

/** コメント 1 件 */
export const ticketCommentResponseSchema = z.object({
    id: z.number(),
    ticketId: z.number(),
    // サービストークンからの書き込みでは null
    authorUuid: z.string().nullish(),
    authorName: z.string(),
    // PLAYER / STAFF
    authorType: z.string(),
    content: z.string(),
    createdAt: z.string(),
});

/** コメント一覧の 1 ページ (古い順) */
export const ticketCommentListResponseSchema = z.object({
    comments: z.array(ticketCommentResponseSchema),
    hasMore: z.boolean(),
    nextCursor: z.number().nullish(),
});

export type TicketResponse = z.infer<typeof ticketResponseSchema>;
export type TicketCommentResponse = z.infer<typeof ticketCommentResponseSchema>;

// --- 画面で使う形 ---

/** 対応状況。API の status を画面用に読み替えたもの */
export type TicketStatus = "open" | "closed";

/** クローズした理由 */
export type TicketCloseReason = "done" | "not-planned" | "duplicate";

/** 一覧と詳細で共通のチケットの内容 */
export interface Ticket {
    id: number;
    status: TicketStatus;
    /** クローズしたときだけ入る。知らない理由は null */
    closeReason: TicketCloseReason | null;
    /** カテゴリーの表示名。消されたカテゴリーは null */
    categoryName: string | null;
    content: string;
    /** 送信日時 (ISO-8601) */
    createdAt: string;
    /** 送信したプレイヤー */
    player: { id: string; name: string };
}

/** コメントを書いた人の立場 */
export type TicketCommentAuthorType = "player" | "staff";

/** コメント 1 件 */
export interface TicketComment {
    id: number;
    authorType: TicketCommentAuthorType;
    /** 書いた人の UUID。サービスからの書き込みでは null (顔を出さない) */
    authorId: string | null;
    authorName: string;
    content: string;
    /** 書き込み日時 (ISO-8601) */
    createdAt: string;
}

/** チケットの詳細 */
export interface TicketDetail {
    ticket: Ticket;
    /** 古い順のコメント */
    comments: TicketComment[];
    /** 自分のチケットか。自分のものでなければ返信できない */
    isMine: boolean;
}

/** 詳細の取得結果。自分のものでもスタッフとして見られるものでもなければ not-found */
export type TicketDetailResult =
    | { kind: "found"; detail: TicketDetail }
    | { kind: "not-found" };

/** 返信の結果。API に断られたときは理由を返す */
export type AddTicketCommentResult =
    | { ok: true }
    | { ok: false; message: string };
