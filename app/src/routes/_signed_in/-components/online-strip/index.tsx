import { PlayerAvatar } from "@morinoparty/chlorophyll-react/components";
import { ChevronRightIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { useEffect, useRef } from "react";
import { css, cx, sva } from "../../../../../styled-system/css";
import {
    InlineSkeleton,
    Skeleton,
    skeletonKeys,
} from "../../../../components/skeleton";
import type { OnlinePlayer } from "../../-types/online-player";

// 読み込み中に並べておく顔の数。帯の幅に収まる程度にする
const SKELETON_AVATAR_COUNT = 5;

const onlineStripStyle = sva({
    slots: ["root", "count", "live", "label", "faces", "face", "chevron"],
    base: {
        root: {
            display: "flex",
            alignItems: "center",
            gap: "2.5",
            width: "full",
            minHeight: "11",
            paddingY: "2",
            paddingLeft: "3.5",
            paddingRight: "3",
            bg: "colorPalette.surface.subtle",
            borderRadius: "full",
            color: "colorPalette.fg",
            textAlign: "start",
        },
        // 人数は顔が何人いても縮めず、帯の左に固定する
        count: {
            display: "flex",
            flexShrink: "0",
            alignItems: "center",
            gap: "1.5",
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
        // 全員の顔を重ねずに並べ、帯に入りきらない分は横にスクロールして見せる
        faces: {
            display: "flex",
            flex: "1",
            alignItems: "center",
            gap: "1.5",
            minWidth: "0",
            // 縁取りが切れないよう、上下と左に縁取りの太さぶんの余白を取る
            padding: "0.5",
            overflowX: "auto",
            overscrollBehaviorX: "contain",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            // 右に続きがあるときだけ、右端で顔をふんわり消して横に動かせることを示す
            "&[data-more]": {
                maskImage:
                    "linear-gradient(to right, black calc(100% - 2.5rem), transparent)",
            },
        },
        face: {
            // インラインのままだと行の高さぶん縦に伸び、縁が顔より大きくなって顔が上に寄るため、顔の大きさに合わせる
            display: "flex",
            flexShrink: "0",
            borderRadius: "full",
            // PlayerAvatar は角丸の四角なので、縁取りと同じ真円に切りそろえる
            "& > *, & img": { borderRadius: "full" },
            // 縁取りを画面の地の色にして、顔と帯の地の境目を出す
            outline: "2px solid",
            outlineColor: "colorPalette.bg",
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
    const facesRef = useRef<HTMLSpanElement>(null);

    // 顔の並びが帯からはみ出していて、まだ右端まで送っていないときだけ data-more を付ける
    useEffect(() => {
        const faces = facesRef.current;
        if (!faces) return;
        const update = () => {
            // 小数の幅の誤差で消え残らないよう 1px の余裕を見る
            const hasMore =
                faces.scrollLeft + faces.clientWidth < faces.scrollWidth - 1;
            faces.toggleAttribute("data-more", hasMore);
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(faces);
        faces.addEventListener("scroll", update, { passive: true });
        return () => {
            observer.disconnect();
            faces.removeEventListener("scroll", update);
        };
    }, [count]);

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
            <span className={style.count}>
                <span className={style.live} />
                <span className={style.label}>{count}人がプレイ中</span>
            </span>
            {/* 読み上げは aria-label で足りるため、顔の並びは装飾として隠す */}
            <span ref={facesRef} className={style.faces} aria-hidden>
                {players.map((player) => (
                    <span key={player.id} className={style.face}>
                        <PlayerAvatar
                            playerId={player.id}
                            playerName={player.name}
                            size="sm"
                            decorative
                        />
                    </span>
                ))}
            </span>
            <ChevronRightIcon className={style.chevron} aria-hidden />
        </button>
    );
};

// 顔の並び (sm は 32px) と同じ大きさの丸
const skeletonAvatarStyle = css({
    flexShrink: "0",
    width: "8",
    height: "8",
});

/** オンライン一覧が届くまでの帯。人数の文字と顔の並びの場所を取り、届いても高さを変えない */
export const OnlineStripSkeleton = ({ className }: { className?: string }) => {
    // variant を付けず基本の形だけにする (押せる帯と同じ余白で、ホバーの色は付けない)
    const style = onlineStripStyle();
    return (
        <div className={cx(style.root, className)}>
            <span className={style.count}>
                <span className={style.label}>
                    <InlineSkeleton width="7em" />
                </span>
            </span>
            <span className={style.faces}>
                {skeletonKeys(SKELETON_AVATAR_COUNT).map((key) => (
                    <Skeleton
                        key={key}
                        variant="circle"
                        className={skeletonAvatarStyle}
                    />
                ))}
            </span>
        </div>
    );
};
