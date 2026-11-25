import type { Ticket, TicketCloseReason } from "../-types/ticket";

// クローズした理由の表示名 (ゲーム内の表示にそろえる)
const CLOSE_REASON_LABELS: Record<TicketCloseReason, string> = {
    done: "対応完了",
    "not-planned": "対応しない",
    duplicate: "重複",
};

/** 対応状況のピルに出す文言 */
export const ticketStatusLabel = (
    ticket: Pick<Ticket, "status" | "closeReason">,
): string => {
    if (ticket.status === "open") {
        return "対応中";
    }
    // 理由が分からないクローズは「クローズ」だけを出す
    return ticket.closeReason
        ? CLOSE_REASON_LABELS[ticket.closeReason]
        : "クローズ";
};

/** 返信できるか。自分のチケットで、まだクローズしていないものだけ */
export const canReplyToTicket = (
    ticket: Pick<Ticket, "status">,
    isMine: boolean,
): boolean => isMine && ticket.status === "open";
