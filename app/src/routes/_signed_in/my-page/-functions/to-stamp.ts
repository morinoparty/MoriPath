import type { Stamp, StampResponseItem } from "../-types/stamp";

/** API のスタンプを画面用に変換する。未知の種類は表示できないので null */
export const toStamp = (
    item: StampResponseItem,
    emojiMap: Readonly<Record<string, string>>,
): Stamp | null => {
    if (item.type === "EMOJI") {
        const emoji = emojiMap[item.shortCode];
        // 対応表に無い絵文字は字形なしで返し、画面では仮のタイルにする
        return emoji
            ? { shortCode: item.shortCode, type: "EMOJI", emoji }
            : { shortCode: item.shortCode, type: "EMOJI" };
    }
    if (item.type === "IMAGE") {
        return { shortCode: item.shortCode, type: "IMAGE" };
    }
    return null;
};
