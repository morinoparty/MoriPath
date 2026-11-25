import type { Stamp, StampEmojiEntry } from "../-types/stamp";

/**
 * 画像スタンプ (Morino Party 独自のスタンプ) を絵文字より先に並べるか。
 * 数が少なく、このサーバーにしか無いスタンプなので先頭に置く。後ろに回すなら false にする
 */
export const IMAGE_STAMPS_FIRST = true;

/** 並びの大きな区分。小さいほど先に並べる */
const toSection = (
    stamp: Stamp,
    emojiMap: ReadonlyMap<string, StampEmojiEntry>,
): number => {
    if (stamp.type === "IMAGE") {
        return IMAGE_STAMPS_FIRST ? 0 : 2;
    }
    // 対応表に無い絵文字は字形が無く仮のタイルになるため、いちばん後ろに回す
    return emojiMap.has(stamp.shortCode) ? 1 : 3;
};

/**
 * スタンプをよく使われる順に並べ替えた新しい配列を返す。
 * 絵文字は生成時に決めた並び順 (Unicode の使用頻度 → CLDR の並び) を使う
 */
export const orderStamps = (
    stamps: readonly Stamp[],
    emojiMap: ReadonlyMap<string, StampEmojiEntry>,
): Stamp[] =>
    stamps
        .map((stamp) => ({
            stamp,
            section: toSection(stamp, emojiMap),
            // 並び順の無いものは同じ区分の中で shortCode 順にする
            sortIndex:
                emojiMap.get(stamp.shortCode)?.sortIndex ??
                Number.POSITIVE_INFINITY,
        }))
        .sort(
            (a, b) =>
                a.section - b.section ||
                (a.sortIndex === b.sortIndex ? 0 : a.sortIndex - b.sortIndex) ||
                (a.stamp.shortCode < b.stamp.shortCode ? -1 : 1),
        )
        .map(({ stamp }) => stamp);
