import { Stamp as StampIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cx, sva } from "../../../../../../styled-system/css";
import { toStampImagePath } from "../../-functions/stamp-display";
import type { Stamp } from "../../-types/stamp";

const stampTileStyle = sva({
    slots: ["root", "image"],
    base: {
        root: {
            // 枠線を持たない面のタイル
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            aspectRatio: "1",
            bg: "colorPalette.surface.subtle",
            borderRadius: "control",
            overflow: "hidden",
            lineHeight: "1",
            color: "colorPalette.fg.muted",
            userSelect: "none",
        },
        image: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
        },
    },
    variants: {
        size: {
            // マイページの 1 列に並べる小さなタイル。絵文字はタイルの半分強の大きさにする
            sm: {
                root: {
                    fontSize: "24px",
                    "& svg": { width: "20px", height: "20px" },
                },
            },
            // スタンプ帳のページで格子に並べる大きなタイル
            lg: {
                root: {
                    fontSize: "36px",
                    "& svg": { width: "28px", height: "28px" },
                },
            },
        },
    },
    defaultVariants: {
        size: "sm",
    },
});

interface StampImageProps {
    src: string;
    className: string;
    onFailed: () => void;
}

/** 画像スタンプ。読み込めなければ onFailed で仮のタイルに切り替えてもらう */
const StampImage = ({ src, className, onFailed }: StampImageProps) => {
    const imageRef = useRef<HTMLImageElement>(null);
    // SSR の HTML で先に読み込みが失敗すると onError が届かないため、マウント時にも確かめる
    useEffect(() => {
        const image = imageRef.current;
        if (image?.complete && image.naturalWidth === 0) {
            onFailed();
        }
    }, [onFailed]);
    return (
        // スタンプ名は呼び出し側で添えるため、画像そのものは飾りとして扱う
        <img
            ref={imageRef}
            src={src}
            alt=""
            className={className}
            loading="lazy"
            decoding="async"
            onError={onFailed}
        />
    );
};

export interface StampTileProps {
    stamp: Stamp;
    /** タイルの大きさ。マイページの 1 列は sm、スタンプ帳のページは lg */
    size?: "sm" | "lg";
    /** 長押しやホバーで出すスタンプ名 */
    title?: string;
    className?: string;
}

/**
 * スタンプ 1 枚の見た目。絵文字は字形、画像は /stamp/ 配下の画像、どちらも無ければ仮のアイコン。
 * 読み上げには含めないので、スタンプ名は呼び出し側で添える
 */
export const StampTile = ({
    stamp,
    size,
    title,
    className,
}: StampTileProps) => {
    const classes = stampTileStyle({ size });
    const [imageFailed, setImageFailed] = useState(false);
    // StampImage の effect が描画のたびに走らないよう、関数を固定する
    const handleImageFailed = useCallback(() => setImageFailed(true), []);
    const imagePath =
        stamp.type === "IMAGE" ? toStampImagePath(stamp.shortCode) : null;

    return (
        <span className={cx(classes.root, className)} title={title} aria-hidden>
            {imagePath && !stamp.emoji && !imageFailed ? (
                <StampImage
                    src={imagePath}
                    className={classes.image}
                    onFailed={handleImageFailed}
                />
            ) : (
                (stamp.emoji ?? <StampIcon />)
            )}
        </span>
    );
};
