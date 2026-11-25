import { Stamp as StampIcon } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cx, sva } from "../../../../../../styled-system/css";
import { toStampImagePath, toStampLabel } from "../../-functions/stamp-display";
import type { MyStamps, Stamp } from "../../-types/stamp";

/** 1 列に並べるスタンプの最大数。残りは「+N」のタイルにまとめる */
const VISIBLE_STAMP_COUNT = 6;

const stampBookStyle = sva({
    slots: [
        "root",
        "header",
        "title",
        "count",
        "row",
        "tile",
        "image",
        "rest",
        "label",
        "empty",
    ],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "3",
        },
        header: {
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "3",
        },
        title: {
            // メニューのセクション見出しとそろえる
            fontSize: "18px",
            fontWeight: "bold",
            lineHeight: "1.5",
            color: "colorPalette.fg",
        },
        count: {
            textStyle: "sm",
            color: "colorPalette.fg.muted",
            fontVariantNumeric: "tabular-nums",
        },
        row: {
            // 6 枚 + 「+N」の 7 枠。狭い画面ではタイルを縮めて 1 列に収める
            display: "grid",
            gridTemplateColumns: `repeat(${VISIBLE_STAMP_COUNT + 1}, minmax(0, 44px))`,
            justifyContent: "space-between",
            gap: "1.5",
            listStyle: "none",
            margin: "0",
            padding: "0",
        },
        tile: {
            // 枠線を持たない面のタイル
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            aspectRatio: "1",
            bg: "colorPalette.surface.subtle",
            borderRadius: "control",
            overflow: "hidden",
            // 絵文字の字形はタイルの半分強の大きさにする
            fontSize: "24px",
            lineHeight: "1",
            color: "colorPalette.fg.muted",
            userSelect: "none",
            "& svg": { width: "20px", height: "20px" },
        },
        image: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
        },
        label: {
            // 画面には出さず、読み上げにだけスタンプ名を渡す
            srOnly: true,
        },
        rest: {
            // 残り枚数は字形より小さい文字で添える
            textStyle: "sm",
            fontWeight: "medium",
            fontVariantNumeric: "tabular-nums",
        },
        empty: {
            textStyle: "sm",
            color: "colorPalette.fg.muted",
        },
    },
});

type StampBookClasses = ReturnType<typeof stampBookStyle>;

interface StampImageProps {
    src: string;
    alt: string;
    className: string;
    onFailed: () => void;
}

/** 画像スタンプ。読み込めなければ onFailed で仮のタイルに切り替えてもらう */
const StampImage = ({ src, alt, className, onFailed }: StampImageProps) => {
    const imageRef = useRef<HTMLImageElement>(null);
    // SSR の HTML で先に読み込みが失敗すると onError が届かないため、マウント時にも確かめる
    useEffect(() => {
        const image = imageRef.current;
        if (image?.complete && image.naturalWidth === 0) {
            onFailed();
        }
    }, [onFailed]);
    return (
        <img
            ref={imageRef}
            src={src}
            alt={alt}
            className={className}
            loading="lazy"
            decoding="async"
            onError={onFailed}
        />
    );
};

interface StampTileProps {
    stamp: Stamp;
    classes: StampBookClasses;
}

/** スタンプ 1 枚。絵文字は字形、画像は /stamp/ 配下の画像、どちらも無ければ仮のアイコン */
const StampTile = ({ stamp, classes }: StampTileProps) => {
    const [imageFailed, setImageFailed] = useState(false);
    // StampImage の effect が描画のたびに走らないよう、関数を固定する
    const handleImageFailed = useCallback(() => setImageFailed(true), []);
    const label = toStampLabel(stamp.shortCode);
    const imagePath =
        stamp.type === "IMAGE" ? toStampImagePath(stamp.shortCode) : null;

    // 画像が出せるときは alt で、それ以外は読み上げ用の文字でスタンプ名を伝える
    if (imagePath && !stamp.emoji && !imageFailed) {
        return (
            <li className={classes.tile} title={label}>
                <StampImage
                    src={imagePath}
                    alt={label}
                    className={classes.image}
                    onFailed={handleImageFailed}
                />
            </li>
        );
    }

    return (
        <li className={classes.tile} title={label}>
            {/* 絵文字は読み上げると名前と食い違うことがあるため、名前だけを読ませる */}
            <span aria-hidden>{stamp.emoji ?? <StampIcon />}</span>
            <span className={classes.label}>{label}</span>
        </li>
    );
};

export interface StampBookProps {
    stamps: MyStamps;
    className?: string;
}

/** マイページのスタンプ帳。持っているスタンプの先頭 6 枚と、残りの枚数を並べる */
export const StampBook = ({ stamps, className }: StampBookProps) => {
    const classes = stampBookStyle();
    const titleId = useId();
    const visible = stamps.owned.slice(0, VISIBLE_STAMP_COUNT);
    const restCount = stamps.owned.length - visible.length;

    return (
        <section
            className={cx(classes.root, className)}
            aria-labelledby={titleId}
        >
            <div className={classes.header}>
                <h2 id={titleId} className={classes.title}>
                    スタンプ帳
                </h2>
                <span className={classes.count}>
                    {stamps.owned.length.toLocaleString()} /{" "}
                    {stamps.total.toLocaleString()}
                </span>
            </div>
            {visible.length === 0 ? (
                <p className={classes.empty}>まだスタンプがありません</p>
            ) : (
                <ul className={classes.row}>
                    {visible.map((stamp) => (
                        <StampTile
                            key={stamp.shortCode}
                            stamp={stamp}
                            classes={classes}
                        />
                    ))}
                    {restCount > 0 && (
                        <li className={classes.tile}>
                            <span className={classes.rest} aria-hidden>
                                +{restCount}
                            </span>
                            <span className={classes.label}>
                                ほか {restCount} 枚
                            </span>
                        </li>
                    )}
                </ul>
            )}
        </section>
    );
};
