/** fitFontSize の入力。幅はどれも同じ単位 (px など) であればよい */
export interface FitFontSizeInput {
    /** 現在のフォントサイズで描いたときの文字列の幅 */
    textWidth: number;
    /** textWidth を測ったときのフォントサイズ */
    measuredFontSize: number;
    /** 文字列を収めたい領域の幅 */
    containerWidth: number;
    /** 収まるときに使う最大 (既定) のフォントサイズ */
    baseFontSize: number;
    /** これより小さくはしない */
    minFontSize: number;
}

/**
 * 1 行の文字列が containerWidth に収まるフォントサイズを求める。
 * 文字幅 (em 指定の字間も含む) はフォントサイズに比例する前提で、比で縮める
 */
export const fitFontSize = ({
    textWidth,
    measuredFontSize,
    containerWidth,
    baseFontSize,
    minFontSize,
}: FitFontSizeInput): number => {
    // 測れていない (非表示・未レイアウト) ときは既定サイズのままにする
    if (textWidth <= 0 || measuredFontSize <= 0 || containerWidth <= 0) {
        return baseFontSize;
    }
    // 既定サイズで描いたときの幅に換算する
    const widthAtBase = (textWidth * baseFontSize) / measuredFontSize;
    if (widthAtBase <= containerWidth) {
        return baseFontSize;
    }
    // 小数点以下 2 桁で切り捨て、丸めではみ出さないようにする
    const fitted =
        Math.floor(((baseFontSize * containerWidth) / widthAtBase) * 100) / 100;
    return Math.max(minFontSize, fitted);
};
