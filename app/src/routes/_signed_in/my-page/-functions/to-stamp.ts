import type {
    Stamp,
    StampEmojiEntry,
    StampResponseItem,
} from "../-types/stamp";
import { toStampLabel } from "./stamp-display";

/** API のスタンプを画面用に変換する。未知の種類は表示できないので null */
export const toStamp = (
    item: StampResponseItem,
    emojiMap: ReadonlyMap<string, StampEmojiEntry>,
): Stamp | null => {
    if (item.type === "EMOJI") {
        const entry = emojiMap.get(item.shortCode);
        // 対応表に無い絵文字は字形なしで返し、画面では仮のタイルにする
        return entry
            ? {
                  shortCode: item.shortCode,
                  type: "EMOJI",
                  emoji: entry.emoji,
                  label: entry.label,
              }
            : {
                  shortCode: item.shortCode,
                  type: "EMOJI",
                  label: toStampLabel(item.shortCode),
              };
    }
    if (item.type === "IMAGE") {
        return {
            shortCode: item.shortCode,
            type: "IMAGE",
            label: toStampLabel(item.shortCode),
        };
    }
    return null;
};
