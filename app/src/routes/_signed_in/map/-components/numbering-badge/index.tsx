import { css, cva } from "../../../../../../styled-system/css";
import { lineColorTone } from "../../-functions/line-color-tone";

const numberingBadgeStyle = cva({
    base: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontWeight: "bold",
        lineHeight: "1",
        fontVariantNumeric: "tabular-nums",
    },
    variants: {
        // stacked は地図の上の標識 (記号と番号を縦に並べる)、inline は一覧の中で文字と並べる横長の札
        layout: {
            // 実際の駅ナンバリング標識のように、路線の色の太い枠の角丸四角に記号と番号を縦に並べる
            stacked: {
                flexDirection: "column",
                // 文字は路線の色の上ではなく面 (bg.panel) の上に置く。路線の色は枠だけに使うので、
                // 黄色のような明るい色でも紺のような暗い色でも、ライト・ダークの両方で文字のコントラストは変わらない
                bg: "bg.panel",
                color: "fg",
                borderStyle: "solid",
                // 路線の色はデータ由来なので CSS 変数で受け取る。分からなければブランド色にする
                borderColor: "var(--line-color, {colors.colorPalette.solid})",
            },
            // 一覧の札は路線の色で塗りつぶし、文字の色は路線の色の明るさで白か黒を選ぶ (枠は付けない)
            inline: {
                flexDirection: "row",
                bg: "var(--line-color, {colors.colorPalette.solid})",
                // 色が分からない (ブランド色で塗る) ときはブランド色の上の文字色
                color: "colorPalette.contrast",
                "&[data-tone=dark]": { color: "white" },
                "&[data-tone=light]": { color: "black" },
                // 文字の行に並べるので、番号の数字は Outfit で 1 行にまとめる
                fontFamily: "display",
                fontWeight: "semibold",
                whiteSpace: "nowrap",
            },
        },
        size: {
            sm: {},
            md: {},
        },
    },
    // 大きさごとの寸法は並べ方で変わるため、組み合わせで決める
    compoundVariants: [
        {
            layout: "stacked",
            size: "sm",
            css: {
                minWidth: "24px",
                height: "24px",
                px: "2px",
                borderWidth: "2px",
                borderRadius: "6px",
                gap: "1px",
                "& [data-part=prefix]": { fontSize: "7px" },
                "& [data-part=number]": { fontSize: "10px" },
            },
        },
        {
            layout: "stacked",
            size: "md",
            css: {
                minWidth: "32px",
                height: "32px",
                px: "3px",
                borderWidth: "3px",
                borderRadius: "8px",
                gap: "2px",
                "& [data-part=prefix]": { fontSize: "9px" },
                "& [data-part=number]": { fontSize: "13px" },
            },
        },
        {
            layout: "inline",
            size: "sm",
            css: {
                height: "20px",
                px: "5px",
                borderWidth: "2px",
                borderRadius: "6px",
                fontSize: "11px",
            },
        },
        {
            layout: "inline",
            size: "md",
            css: {
                height: "22px",
                px: "6px",
                borderWidth: "2px",
                borderRadius: "6px",
                fontSize: "12px",
            },
        },
    ],
    defaultVariants: {
        layout: "stacked",
        size: "md",
    },
});

/** 「FM06」を記号「FM」と番号「06」に分ける。分けられなければ全体を番号として扱う */
const splitCode = (code: string) => {
    const match = code.match(/^([^\d]+)(\d+)$/);
    return match
        ? { prefix: match[1], number: match[2] }
        : { prefix: "", number: code };
};

export interface NumberingBadgeProps {
    /** 「FM06」などの駅ナンバリング */
    code: string;
    /** 路線の色 (#RRGGBB)。null ならブランド色 */
    color: string | null;
    size?: "sm" | "md";
    /** stacked は記号と番号を縦に並べる標識 (地図用)、inline は「PAK07」を 1 行で書く札 (一覧用) */
    layout?: "stacked" | "inline";
}

/** 駅ナンバリングの標識 (地図は路線の色の枠に記号と番号、一覧は路線の色で塗った札) */
export const NumberingBadge = ({
    code,
    color,
    size = "md",
    layout = "stacked",
}: NumberingBadgeProps) => {
    const style = color
        ? ({ "--line-color": color } as React.CSSProperties)
        : undefined;
    // 横長の札は番号をそのまま 1 行で書く (接頭辞だけの「PAK」もそのまま出す)
    if (layout === "inline") {
        return (
            <span
                className={numberingBadgeStyle({ size, layout })}
                style={style}
                data-tone={lineColorTone(color) ?? undefined}
            >
                {code}
            </span>
        );
    }
    const { prefix, number } = splitCode(code);
    return (
        <span className={numberingBadgeStyle({ size, layout })} style={style}>
            {/* 記号と番号を分けて置くので、読み上げはまとめた番号にする */}
            <span className={css({ srOnly: true })}>{code}</span>
            {prefix && (
                <span data-part="prefix" aria-hidden>
                    {prefix}
                </span>
            )}
            <span data-part="number" aria-hidden>
                {number}
            </span>
        </span>
    );
};
