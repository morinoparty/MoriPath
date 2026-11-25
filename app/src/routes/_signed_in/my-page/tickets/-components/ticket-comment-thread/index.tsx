import { Badge, PlayerAvatar } from "@morinoparty/chlorophyll-react/components";
import { Headset } from "lucide-react";
import { sva } from "../../../../../../../styled-system/css";
import { formatTicketTime } from "../../-functions/format-ticket-time";
import type { TicketComment } from "../../-types/ticket";

const ticketCommentThreadStyle = sva({
    slots: [
        "list",
        "item",
        "avatar",
        "serviceAvatar",
        "body",
        "header",
        "name",
        "time",
        "bubble",
    ],
    base: {
        list: {
            display: "flex",
            flexDirection: "column",
            gap: "4",
            listStyle: "none",
            margin: "0",
            padding: "0",
        },
        item: {
            display: "flex",
            alignItems: "flex-start",
            gap: "2.5",
            // 自分の書き込みは右に寄せ、顔も右に置く
            "&[data-own]": {
                flexDirection: "row-reverse",
            },
        },
        avatar: {
            flexShrink: "0",
        },
        // サービスからの書き込みは顔が無いため、PlayerAvatar (sm) と同じ大きさのアイコンを置く
        serviceAvatar: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: "0",
            width: "8",
            height: "8",
            borderRadius: "lg",
            bg: "colorPalette.surface.subtle",
            color: "colorPalette.fg.muted",
            "& svg": { width: "4.5", height: "4.5" },
        },
        body: {
            display: "flex",
            flexDirection: "column",
            gap: "1",
            minWidth: "0",
            maxWidth: "85%",
            "[data-own] > &": {
                alignItems: "flex-end",
            },
        },
        header: {
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.5",
            "[data-own] &": {
                justifyContent: "flex-end",
            },
        },
        name: {
            fontFamily: "display",
            fontSize: "13px",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        time: {
            fontSize: "12px",
            fontVariantNumeric: "tabular-nums",
            color: "colorPalette.fg.muted",
        },
        // 吹き出しは枠線を持たない面にする。スタッフの返信は地との差を少し強くして見分ける
        bubble: {
            paddingX: "4",
            paddingY: "3",
            bg: "colorPalette.surface.subtle",
            borderRadius: "panel",
            fontSize: "15px",
            lineHeight: "1.6",
            color: "colorPalette.fg",
            // 改行をそのまま見せ、長い URL などで画面からはみ出さないようにする
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
            "[data-author=staff] &": {
                bg: "colorPalette.surface.hover",
            },
        },
    },
});

export interface TicketCommentThreadProps {
    /** 古い順のコメント */
    comments: readonly TicketComment[];
    /** 自分のチケットか。自分のチケットでは、プレイヤーの書き込みを自分のものとして右に寄せる */
    isMine: boolean;
}

/** お問い合わせのやりとり。古い順に並べ、自分とスタッフの書き込みを左右と色で見分ける */
export const TicketCommentThread = ({
    comments,
    isMine,
}: TicketCommentThreadProps) => {
    const style = ticketCommentThreadStyle();
    return (
        <ol className={style.list}>
            {comments.map((comment) => {
                const isOwn = isMine && comment.authorType === "player";
                return (
                    <li
                        key={comment.id}
                        className={style.item}
                        data-own={isOwn ? "" : undefined}
                        data-author={comment.authorType}
                    >
                        {comment.authorId ? (
                            <span className={style.avatar}>
                                <PlayerAvatar
                                    playerId={comment.authorId}
                                    playerName={comment.authorName}
                                    size="sm"
                                    decorative
                                />
                            </span>
                        ) : (
                            <span className={style.serviceAvatar} aria-hidden>
                                <Headset />
                            </span>
                        )}
                        <div className={style.body}>
                            <div className={style.header}>
                                <span className={style.name}>
                                    {comment.authorName}
                                </span>
                                {comment.authorType === "staff" && (
                                    <Badge variant="subtle" size="sm">
                                        スタッフ
                                    </Badge>
                                )}
                                <time
                                    className={style.time}
                                    dateTime={comment.createdAt}
                                >
                                    {formatTicketTime(comment.createdAt)}
                                </time>
                            </div>
                            <p className={style.bubble}>{comment.content}</p>
                        </div>
                    </li>
                );
            })}
        </ol>
    );
};
