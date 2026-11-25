import { css, cva } from "../../../../../../styled-system/css";

const numberingBadgeStyle = cva({
    base: {
        // 実際の駅ナンバリング標識のように、路線の色の太い枠の角丸四角に記号と番号を縦に並べる
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        bg: "bg.panel",
        color: "fg",
        borderStyle: "solid",
        // 路線の色はデータ由来なので CSS 変数で受け取る。分からなければブランド色にする
        borderColor: "var(--line-color, {colors.colorPalette.solid})",
        fontWeight: "bold",
        lineHeight: "1",
        fontVariantNumeric: "tabular-nums",
    },
    variants: {
        size: {
            sm: {
                minWidth: "24px",
                height: "24px",
                px: "2px",
                borderWidth: "2px",
                borderRadius: "6px",
                gap: "1px",
                "& [data-part=prefix]": { fontSize: "7px" },
                "& [data-part=number]": { fontSize: "10px" },
            },
            md: {
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
    },
    defaultVariants: {
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
}

/** 駅ナンバリングの標識 (路線の色の枠に記号と番号) */
export const NumberingBadge = ({
    code,
    color,
    size = "md",
}: NumberingBadgeProps) => {
    const { prefix, number } = splitCode(code);
    return (
        <span
            className={numberingBadgeStyle({ size })}
            style={
                color
                    ? ({ "--line-color": color } as React.CSSProperties)
                    : undefined
            }
        >
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
