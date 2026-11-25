import { toDashedUuid } from "../../../../../lib/player-helpers";
import type {
    Ticket,
    TicketCloseReason,
    TicketComment,
    TicketCommentResponse,
    TicketResponse,
} from "../-types/ticket";

// API が返すクローズ理由のうち、表示名を持っているもの
const CLOSE_REASONS: readonly TicketCloseReason[] = [
    "done",
    "not-planned",
    "duplicate",
];

/** API の closeReason を画面用に読み替える。知らない値は null */
const toCloseReason = (
    reason: string | null | undefined,
): TicketCloseReason | null =>
    CLOSE_REASONS.find((known) => known === reason?.toLowerCase()) ?? null;

/** API のチケットを画面用の形にする */
export const toTicket = (response: TicketResponse): Ticket => {
    // CLOSED 以外 (OPEN と未知の状態) は、まだ対応中として扱う
    const status =
        response.status.toUpperCase() === "CLOSED" ? "closed" : "open";
    return {
        id: response.id,
        status,
        closeReason:
            status === "closed" ? toCloseReason(response.closeReason) : null,
        categoryName: response.categoryName ?? null,
        content: response.content,
        createdAt: response.createdAt,
        player: {
            // ハイフンの有無を吸収し、顔の画像を引ける形にそろえる
            id: toDashedUuid(response.playerUuid) ?? response.playerUuid,
            name: response.playerName,
        },
    };
};

/** API のコメントを画面用の形にする */
export const toTicketComment = (
    response: TicketCommentResponse,
): TicketComment => ({
    id: response.id,
    // STAFF 以外は送信者 (プレイヤー) の書き込みとして扱う
    authorType:
        response.authorType.toUpperCase() === "STAFF" ? "staff" : "player",
    authorId: response.authorUuid
        ? (toDashedUuid(response.authorUuid) ?? response.authorUuid)
        : null,
    authorName: response.authorName,
    content: response.content,
    createdAt: response.createdAt,
});

/** 一覧を新しい順に並べる (API は id の古い順で返す) */
export const sortTicketsNewestFirst = (tickets: readonly Ticket[]): Ticket[] =>
    [...tickets].sort((a, b) => b.id - a.id);
