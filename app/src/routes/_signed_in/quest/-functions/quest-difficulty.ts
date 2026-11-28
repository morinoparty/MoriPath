import type { QuestDifficulty } from "../-types/quest";

/** 難易度の表示名。ゲーム内の受付嬢の選択肢 (簡単・普通・難しめ) に合わせる */
export const DIFFICULTY_LABELS: Record<QuestDifficulty, string> = {
    easy: "かんたん",
    normal: "ふつう",
    hard: "むずかしい",
    event: "イベント",
    unknown: "クエスト",
};

/** Hard のレア度の表示名。知らないレア度は出さない */
export const RARITY_LABELS: Record<string, string> = {
    rare: "レア",
    very_rare: "激レア",
};
