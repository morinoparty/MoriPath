/**
 * 対応表に名前が無いスタンプの名前。":pizza:" や "!moripa_pink.png" の記号と拡張子を外す
 */
export const toStampLabel = (shortCode: string): string =>
    shortCode.startsWith("!")
        ? shortCode.slice(1).replace(/\.[^.]+$/, "")
        : shortCode.replace(/^:/, "").replace(/:$/, "");

/**
 * 画像スタンプの配信パス。"!moripa_pink.png" → "/stamp/moripa_pink.png"
 * shortCode は外部 API 由来なので、ディレクトリをまたぐ名前は受け付けない
 */
export const toStampImagePath = (shortCode: string): string | null => {
    if (!shortCode.startsWith("!")) {
        return null;
    }
    const fileName = shortCode.slice(1);
    if (
        fileName === "" ||
        fileName.includes("/") ||
        fileName.includes("\\") ||
        fileName.includes("..")
    ) {
        return null;
    }
    return `/stamp/${encodeURIComponent(fileName)}`;
};
