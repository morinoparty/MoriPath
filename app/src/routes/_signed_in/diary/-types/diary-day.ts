import { z } from "zod";
import type { DiaryEntry } from "../../-types/diary";

/** URL やダイアリー API に渡す日付 (タームの開始日 YYYY-MM-DD)。2 月 30 日のような無い日は弾く */
export const diaryDateSchema = z.iso.date();

/** getDiaryByDate の入力 */
export const diaryByDateInputSchema = z.object({
    date: diaryDateSchema,
});

/** getDiaryDates の入力。before はその日を含まない */
export const diaryDatesInputSchema = z.object({
    before: diaryDateSchema,
    limit: z.int().min(1).max(100),
});

/** 1 日分のダイアリー */
export interface DiaryDay {
    /** タームの開始日 YYYY-MM-DD */
    date: string;
    /** その日のまとめ。日が締まる (翌 4 時) までは null */
    summary: string | null;
    /** 本文のある時間だけのタイムライン (タームの順) */
    entries: DiaryEntry[];
}

/** 日付を指定してダイアリーを取った結果 */
export type DiaryDayResult =
    | { kind: "found"; day: DiaryDay }
    /** その日の日記が無い (API が 404) */
    | { kind: "empty" }
    /** 接続先が未設定、または取得に失敗した */
    | { kind: "unavailable" };

/** 日付の帯に並べる 1 日 */
export interface DiaryStripDay {
    /** YYYY-MM-DD */
    date: string;
    /** 日 (1-31) */
    dayOfMonth: number;
    /** 曜日 (「月」など) */
    weekday: string;
    isToday: boolean;
    /** 日記があるか。一覧を取れなかったときは null (分からない) */
    hasDiary: boolean | null;
}

/** タイムラインを朝・昼などに分けたまとまり */
export interface DiaryEntryGroup {
    id: "morning" | "daytime" | "evening" | "night";
    label: string;
    entries: DiaryEntry[];
}
