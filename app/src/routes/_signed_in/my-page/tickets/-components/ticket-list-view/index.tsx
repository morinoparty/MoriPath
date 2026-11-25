import { Button } from "@morinoparty/chlorophyll-react/components";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Inbox } from "lucide-react";
import { sva } from "../../../../../../../styled-system/css";
import { SubPageBar } from "../../../../../../components/sub-page-bar";
import { formatTicketTime } from "../../-functions/format-ticket-time";
import type { Ticket } from "../../-types/ticket";
import { TicketStatusBadge } from "../ticket-status-badge";

const ticketListStyle = sva({
    slots: [
        "root",
        "list",
        "item",
        "meta",
        "category",
        "time",
        "body",
        "content",
        "chevron",
        "state",
        "stateIcon",
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
        list: {
            display: "flex",
            flexDirection: "column",
            gap: "3",
            listStyle: "none",
            margin: "0",
            padding: "0",
        },
        // 1 件ずつ、枠線も影も持たない面のカードにする
        item: {
            display: "flex",
            alignItems: "center",
            gap: "3",
            padding: "4",
            bg: "colorPalette.surface.subtle",
            borderRadius: "panel",
            color: "colorPalette.fg",
            textDecoration: "none",
            transition: "background 0.15s",
            _hover: { bg: "colorPalette.surface.hover" },
            _active: { bg: "colorPalette.surface.active" },
        },
        body: {
            display: "flex",
            flexDirection: "column",
            gap: "2",
            flex: "1",
            minWidth: "0",
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
        // 本文は 2 行までにして、一覧の高さをそろえる
        content: {
            fontSize: "15px",
            fontWeight: "medium",
            lineHeight: "1.5",
            lineClamp: "2",
            overflowWrap: "anywhere",
        },
        chevron: {
            width: "20px",
            height: "20px",
            flexShrink: "0",
            color: "colorPalette.fg.muted",
        },
        // 空のときと読み込めなかったときの表示
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
        stateIcon: {
            width: "8",
            height: "8",
            color: "colorPalette.fg.muted",
        },
        stateText: {
            fontSize: "15px",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
        },
    },
});

export interface TicketListViewProps {
    /** 新しい順のお問い合わせ。読み込めなかったときは null */
    tickets: readonly Ticket[] | null;
    /** 読み込めなかったときの再読み込み */
    onRetry: () => void;
}

/** 自分のお問い合わせの一覧。1 件ずつ面のカードにして、詳細へのリンクにする */
export const TicketListView = ({ tickets, onRetry }: TicketListViewProps) => {
    const style = ticketListStyle();
    return (
        <div className={style.root}>
            <SubPageBar title="お問い合わせ" backTo="/my-page" />
            {tickets === null ? (
                <div className={style.state} role="alert">
                    <p className={style.stateText}>読み込めませんでした</p>
                    <Button intent="secondary" onClick={onRetry}>
                        もう一度読み込む
                    </Button>
                </div>
            ) : tickets.length === 0 ? (
                <div className={style.state}>
                    <Inbox className={style.stateIcon} aria-hidden />
                    <p className={style.stateText}>
                        お問い合わせはまだありません
                    </p>
                </div>
            ) : (
                <ul className={style.list}>
                    {tickets.map((ticket) => (
                        <li key={ticket.id}>
                            <Link
                                to="/my-page/tickets/$id"
                                params={{ id: String(ticket.id) }}
                                className={style.item}
                            >
                                <div className={style.body}>
                                    <div className={style.meta}>
                                        <TicketStatusBadge ticket={ticket} />
                                        <span className={style.category}>
                                            {ticket.categoryName ??
                                                `#${ticket.id}`}
                                        </span>
                                        <time
                                            className={style.time}
                                            dateTime={ticket.createdAt}
                                        >
                                            {formatTicketTime(ticket.createdAt)}
                                        </time>
                                    </div>
                                    <p className={style.content}>
                                        {ticket.content}
                                    </p>
                                </div>
                                <ChevronRight
                                    className={style.chevron}
                                    aria-hidden
                                />
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
