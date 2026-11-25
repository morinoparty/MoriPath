// squaremap のポップアップ・ツールチップは HTML 文字列で届く。
// innerHTML に流し込まず、タグを落としたテキストとして扱うためのヘルパー

// 文字参照のうち squaremap が出しうるものだけを戻す
const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&nbsp;": " ",
};

/** HTML 文字列からタグを取り除き、前後の空白を詰めたテキストにする */
export const stripMarkerHtml = (html: string): string =>
    html
        // 改行タグは区切りとして空白に置き換える
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]*>/g, "")
        .replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (entity) => entities[entity])
        .replace(/\s+/g, " ")
        .trim();
