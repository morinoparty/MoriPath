import { Stamp as StampIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cx, sva } from "../../../../../../styled-system/css";
import { showToast } from "../../../../../components/toaster";
import { copyText } from "../../../../../lib/copy-text";
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
            // 押すと shortCode を写すボタン。ボタン既定の枠と余白を外し、格子の 1 マスに広げる
            width: "100%",
            padding: "0",
            borderWidth: "0",
            font: "inherit",
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
            // 押している間だけ少し縮める。transform なので周りのタイルは動かない
            transition: "transform 0.1s, opacity 0.1s",
            _active: {
                transform: "scale(0.92)",
                opacity: "0.8",
            },
            _motionReduce: {
                transition: "none",
                _active: { transform: "none" },
            },
            _focusVisible: {
                outlineWidth: "2px",
                outlineStyle: "solid",
                outlineColor: "colorPalette.focusRing",
                outlineOffset: "2px",
            },
        },
        image: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            // 画像スタンプはドット絵なので、縮めてもぼかさない
            imageRendering: "pixelated",
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
            // スタンプ帳のページで格子に並べるタイル。44〜60px ほどの幅に合わせる
            lg: {
                root: {
                    fontSize: "28px",
                    "& svg": { width: "22px", height: "22px" },
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
        // スタンプ名はタイルの aria-label で読ませるため、画像そのものは飾りとして扱う
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

interface StampGlyphProps {
    stamp: Stamp;
    /** 画像スタンプの img に付けるクラス */
    imageClassName?: string;
}

/**
 * スタンプの字形。絵文字は字形、画像は /stamp/ 配下の画像、どちらも無ければ仮のアイコン。
 * タイルとコピーの知らせで同じ見た目を使う
 */
export const StampGlyph = ({ stamp, imageClassName }: StampGlyphProps) => {
    const [imageFailed, setImageFailed] = useState(false);
    // StampImage の effect が描画のたびに走らないよう、関数を固定する
    const handleImageFailed = useCallback(() => setImageFailed(true), []);
    const imagePath =
        stamp.type === "IMAGE" ? toStampImagePath(stamp.shortCode) : null;

    if (imagePath && !stamp.emoji && !imageFailed) {
        return (
            <StampImage
                src={imagePath}
                className={imageClassName ?? ""}
                onFailed={handleImageFailed}
            />
        );
    }
    return stamp.emoji ?? <StampIcon />;
};

/** shortCode をクリップボードに写し、結果を toast で知らせる */
const copyStampShortCode = async (stamp: Stamp) => {
    // ゲーム内の /stamp <shortCode> にそのまま貼れるよう、shortCode を加工せずに写す
    const copied = await copyText(stamp.shortCode);
    if (copied) {
        showToast({
            type: "success",
            title: `${stamp.shortCode} をコピーしました`,
            meta: { icon: <StampGlyph stamp={stamp} /> },
        });
    } else {
        showToast({ type: "error", title: "コピーできませんでした" });
    }
};

export interface StampTileProps {
    stamp: Stamp;
    /** タイルの大きさ。マイページの 2 段は sm、スタンプ帳のページは lg */
    size?: "sm" | "lg";
    className?: string;
}

/**
 * スタンプ 1 枚のタイル。押すと shortCode を写す。
 * 画面には名前を出さず、読み上げとホバーのツールチップにだけスタンプ名を渡す
 */
export const StampTile = ({ stamp, size, className }: StampTileProps) => {
    const classes = stampTileStyle({ size });

    return (
        // 絵文字は読み上げると名前と食い違うことがあるため、ボタンの名前はスタンプ名にする
        <button
            type="button"
            className={cx(classes.root, className)}
            aria-label={stamp.label}
            title={stamp.label}
            onClick={() => void copyStampShortCode(stamp)}
        >
            <StampGlyph stamp={stamp} imageClassName={classes.image} />
        </button>
    );
};
