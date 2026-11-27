import { css, cx, sva } from "../../../../../../../styled-system/css";
import type { Town } from "../../-types/town";

// 街の写真 1 枚。円ではなく角丸の四角にする (一覧・検索・路線図で同じ形と大きさの決め方を使う)
const townThumbStyle = css({
    flexShrink: 0,
    width: "var(--thumb-size)",
    height: "var(--thumb-size)",
    borderRadius: "8px",
    objectFit: "cover",
    bg: "colorPalette.surface",
});

export interface TownThumbProps {
    town: Town;
    /** 一辺 (px) */
    size?: number;
    /** 重ねて並べるときの輪郭や重なりなど、呼び出し側で足すスタイル */
    className?: string;
    style?: React.CSSProperties;
}

/** 街の写真を 1 枚、小さな角丸四角で出す (飾りなので読み上げない。街の名前は呼び出し側で書く) */
export const TownThumb = ({
    town,
    size = 32,
    className,
    style,
}: TownThumbProps) => (
    <img
        className={cx(townThumbStyle, className)}
        src={town.photoUrl}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        // 大きさは呼び出し側で変えられるよう CSS 変数で渡す
        style={{ "--thumb-size": `${size}px`, ...style } as React.CSSProperties}
    />
);

const townThumbsStyle = sva({
    slots: ["root", "thumb", "more"],
    base: {
        // 小さな写真を少しずつ重ねて並べる
        root: {
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            isolation: "isolate",
            // 最後の 1 枚の右にも重なり分の余白が残らないようにする
            paddingRight: "8px",
        },
        // 写真の形は TownThumb のまま、カードの色の輪郭で隣の写真と分けて少し重ねる
        thumb: {
            position: "relative",
            marginRight: "-8px",
            outline: "2px solid {colors.colorPalette.surface.subtle}",
        },
        // 出しきれない分の数
        more: {
            position: "relative",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            width: "var(--thumb-size)",
            height: "var(--thumb-size)",
            marginRight: "-8px",
            borderRadius: "8px",
            outline: "2px solid {colors.colorPalette.surface.subtle}",
            bg: "colorPalette.surface",
            color: "colorPalette.fg",
            fontSize: "11px",
            fontWeight: "bold",
            lineHeight: "1",
        },
    },
});

export interface TownThumbsProps {
    /** 写真を出す街 (並びのまま) */
    towns: Town[];
    /** 写真を出す最大数。超えた分は「+N」にまとめる */
    max?: number;
    /** 1 枚の一辺 (px) */
    size?: number;
}

/** 路線が通る街の写真を、重ねた小さな角丸四角で並べる */
export const TownThumbs = ({ towns, max = 3, size = 26 }: TownThumbsProps) => {
    const style = townThumbsStyle();
    if (towns.length === 0) return null;
    const shown = towns.slice(0, max);
    const rest = towns.length - shown.length;
    return (
        <span
            className={style.root}
            // 大きさは呼び出し側で変えられるよう CSS 変数で渡す
            style={{ "--thumb-size": `${size}px` } as React.CSSProperties}
        >
            {/* 「+N」に隠れた街も含め、通る街の名前はまとめて読み上げる */}
            <span className={css({ srOnly: true })}>
                {towns.map((town) => town.label).join("・")}
            </span>
            {shown.map((town, i) => (
                <TownThumb
                    key={town.slug}
                    town={town}
                    size={size}
                    className={style.thumb}
                    // 先の写真ほど上に重ねる
                    style={{ zIndex: shown.length - i + 1 }}
                />
            ))}
            {rest > 0 && (
                <span className={style.more} style={{ zIndex: 0 }} aria-hidden>
                    +{rest}
                </span>
            )}
        </span>
    );
};
