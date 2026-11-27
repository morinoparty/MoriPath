// 「#RRGGBB」または「#RGB」の路線の色
const hexColorPattern = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

// sRGB の 0〜255 を、相対輝度の計算に使う線形の値 (0〜1) にする (WCAG 2 の定義)
const toLinear = (channel: number) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

/**
 * 路線の色で塗った札の上に置く文字の明暗。白と黒のうちコントラスト比が高いほうを選ぶ。
 * 明るい色 (#FFF000 など) は "light" (黒い文字)、暗い色は "dark" (白い文字)。色の形が読めなければ null
 */
export const lineColorTone = (
    color: string | null,
): "light" | "dark" | null => {
    const match = color ? hexColorPattern.exec(color.trim()) : null;
    if (!match) return null;
    // 3 桁は 1 桁ずつ 2 回くり返して 6 桁にする
    const hex =
        match[1].length === 3
            ? [...match[1]].map((digit) => digit + digit).join("")
            : match[1];
    const [r, g, b] = [0, 2, 4].map((start) =>
        toLinear(Number.parseInt(hex.slice(start, start + 2), 16)),
    );
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // 白とのコントラスト (1.05 / (L + 0.05)) と黒とのコントラスト ((L + 0.05) / 0.05) が等しくなる輝度が境目
    return luminance > 0.179 ? "light" : "dark";
};
