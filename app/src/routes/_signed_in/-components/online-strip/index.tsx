import { PlayerAvatarGroup } from "@morinoparty/chlorophyll-react/components";
import { ChevronRightIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cx, sva } from "../../../../../styled-system/css";
import type { OnlinePlayer } from "../../-types/online-player";

// 帯に顔を並べる最大人数。超えた分は「+N」にまとめる
const MAX_VISIBLE_AVATARS = 3;

const onlineStripStyle = sva({
    slots: ["root", "count", "live", "label", "chevron"],
    base: {
        root: {
            display: "flex",
            alignItems: "center",
            gap: "2.5",
            width: "full",
            minHeight: "11",
            paddingY: "2",
            paddingLeft: "2.5",
            paddingRight: "3.5",
            bg: "colorPalette.surface.subtle",
            borderRadius: "full",
            color: "colorPalette.fg",
            textAlign: "start",
            // アバターの縁取りを帯の地ではなく画面の地の色にして、顔どうしの境目を出す
            "--player-avatar-group-ring-color": "{colors.colorPalette.bg}",
        },
        count: {
            display: "flex",
            flex: "1",
            alignItems: "center",
            gap: "1.5",
            minWidth: "0",
        },
        // いま遊んでいる人がいることを示す小さな点
        live: {
            flexShrink: "0",
            width: "2",
            height: "2",
            borderRadius: "full",
            bg: "colorPalette.solid",
        },
        label: {
            textStyle: "sm",
            fontWeight: "bold",
            lineHeight: "1.4",
            whiteSpace: "nowrap",
        },
        chevron: {
            flexShrink: "0",
            width: "4.5",
            height: "4.5",
            color: "colorPalette.fg.muted",
        },
    },
    variants: {
        // 誰かいれば一覧を開くボタン、誰もいなければ押せない控えめな帯にする
        interactive: {
            true: {
                root: {
                    cursor: "pointer",
                    transitionProperty: "background",
                    transitionDuration: "fast",
                    _hover: { bg: "colorPalette.surface.hover" },
                    _active: { bg: "colorPalette.surface.active" },
                },
            },
            false: {
                root: {
                    paddingLeft: "4",
                    color: "colorPalette.fg.muted",
                },
            },
        },
    },
});

export interface OnlineStripProps extends ComponentProps<"button"> {
    /** いまオンラインのプレイヤー */
    players: OnlinePlayer[];
}

/**
 * ホームのタイトル下に出す、オンラインのプレイヤーの帯。
 * Dialog.Trigger の asChild で包まれる前提で、ボタンの props (ref を含む) をそのまま受け取る
 */
export const OnlineStrip = ({
    players,
    className,
    ...buttonProps
}: OnlineStripProps) => {
    const count = players.length;

    // 誰もいないときは開いても空なので、ボタンにせず一言だけ出す
    if (count === 0) {
        const style = onlineStripStyle({ interactive: false });
        return (
            <div className={cx(style.root, className)}>
                <span className={style.label}>いまは誰もいません</span>
            </div>
        );
    }

    const style = onlineStripStyle({ interactive: true });
    return (
        <button
            type="button"
            // 顔と人数は見た目の要約なので、読み上げは操作内容と人数にまとめる
            aria-label={`オンラインのプレイヤーを見る (${count}人)`}
            {...buttonProps}
            className={cx(style.root, className)}
        >
            {/* 読み上げは aria-label で足りるため、顔の並びは装飾として隠す */}
            <PlayerAvatarGroup
                players={players}
                max={MAX_VISIBLE_AVATARS}
                size="sm"
                aria-hidden
            />
            <span className={style.count}>
                <span className={style.live} />
                <span className={style.label}>{count}人がプレイ中</span>
            </span>
            <ChevronRightIcon className={style.chevron} aria-hidden />
        </button>
    );
};
