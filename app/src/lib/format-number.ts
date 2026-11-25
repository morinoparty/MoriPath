/**
 * 画面の数字を桁区切りする。
 * Worker の SSR とブラウザでロケールが違うと区切り文字がずれて hydration が食い違うため、ja-JP に固定する
 */
export const formatNumber = (value: number): string =>
    value.toLocaleString("ja-JP");
