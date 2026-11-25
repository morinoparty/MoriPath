import { Button } from "@morinoparty/chlorophyll-react/components";
import { Link } from "@tanstack/react-router";
import { sva } from "../../../../../../../styled-system/css";
import { SubPageBar } from "../../../../../../components/sub-page-bar";
import { formatTicketTime } from "../../-functions/format-ticket-time";
import { canReplyToTicket } from "../../-functions/ticket-status";
import type { TicketDetailResult } from "../../-types/ticket";
import { TicketCommentThread } from "../ticket-comment-thread";
import {
    TicketReplyForm,
    type TicketReplyFormProps,
} from "../ticket-reply-form";
import { TicketStatusBadge } from "../ticket-status-badge";

// 戻るボタンの行き先 (お問い合わせの一覧)
const BACK_TO = "/my-page/tickets";

const ticketDetailStyle = sva({
    slots: [
        "root",
        "card",
        "meta",
        "category",
        "time",
        "content",
        "note",
        "state",
        "stateText",
    ],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "5",
            minHeight: "100dvh",
            paddingX: "6",
            paddingTop: "4",
            paddingBottom:
                "max({spacing.6}, calc(env(safe-area-inset-bottom) + {spacing.2}))",
            bg: "colorPalette.bg",
        },
        // 送った内容は枠線も影も持たない面のカードにまとめる
        card: {
            display: "flex",
            flexDirection: "column",
            gap: "3",
            padding: "5",
            bg: "colorPalette.surface.subtle",
            borderRadius: "panel",
        },
        meta: {
            display: "flex",
            alignItems: "center",
            gap: "2",
            minWidth: "0",
        },
        category: {
            flex: "1",
            minWidth: "0",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "13px",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
        },
        time: {
            flexShrink: "0",
            fontSize: "12px",
            fontVariantNumeric: "tabular-nums",
            color: "colorPalette.fg.muted",
        },
        content: {
            fontSize: "16px",
            lineHeight: "1.7",
            color: "colorPalette.fg",
            // 改行をそのまま見せ、長い URL などで画面からはみ出さないようにする
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
        },
        note: {
            fontSize: "14px",
            textAlign: "center",
            color: "colorPalette.fg.muted",
        },
        state: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "3",
            paddingY: "10",
            paddingX: "6",
            bg: "colorPalette.surface.subtle",
            borderRadius: "panel",
            textAlign: "center",
        },
        stateText: {
            fontSize: "15px",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
        },
    },
});

/** 返信フォームの状態と操作 (返信できるときだけ使う) */
export type TicketReplyState = TicketReplyFormProps;

export interface TicketDetailViewProps {
    /** 詳細の取得結果。読み込めなかったときは null */
    result: TicketDetailResult | null;
    reply: TicketReplyState;
    /** 読み込めなかったときの再読み込み */
    onRetry: () => void;
}

/** お問い合わせの詳細。送った内容、やりとり、返信フォームを縦に並べる */
export const TicketDetailView = ({
    result,
    reply,
    onRetry,
}: TicketDetailViewProps) => {
    const style = ticketDetailStyle();

    if (result === null || result.kind === "not-found") {
        return (
            <div className={style.root}>
                <SubPageBar title="お問い合わせ" backTo={BACK_TO} />
                {result === null ? (
                    <div className={style.state} role="alert">
                        <p className={style.stateText}>読み込めませんでした</p>
                        <Button intent="secondary" onClick={onRetry}>
                            もう一度読み込む
                        </Button>
                    </div>
                ) : (
                    <div className={style.state}>
                        <p className={style.stateText}>
                            お問い合わせが見つかりません
                        </p>
                        <Button asChild intent="secondary">
                            <Link to={BACK_TO}>一覧へ</Link>
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    const { ticket, comments, isMine } = result.detail;
    const canReply = canReplyToTicket(ticket, isMine);

    return (
        <div className={style.root}>
            <SubPageBar title={`お問い合わせ #${ticket.id}`} backTo={BACK_TO} />
            <article className={style.card}>
                <div className={style.meta}>
                    <TicketStatusBadge ticket={ticket} />
                    <span className={style.category}>
                        {ticket.categoryName ?? ""}
                    </span>
                    <time className={style.time} dateTime={ticket.createdAt}>
                        {formatTicketTime(ticket.createdAt)}
                    </time>
                </div>
                <p className={style.content}>{ticket.content}</p>
            </article>
            {comments.length > 0 && (
                <TicketCommentThread comments={comments} isMine={isMine} />
            )}
            {canReply ? (
                <TicketReplyForm {...reply} />
            ) : (
                // 自分のチケットでクローズしたものだけ、返信できない理由を短く出す
                isMine && (
                    <p className={style.note}>
                        クローズしたお問い合わせには返信できません
                    </p>
                )
            )}
        </div>
    );
};
