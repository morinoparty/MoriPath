import { z } from "zod";
import type { DiaryEntry } from "../../-types/diary";

/** URL やダイアリー API に渡す日付 (タームの開始日 YYYY-MM-DD)。2 月 30 日のような無い日は弾く */
export const diaryDateSchema = z.iso.date();

/** getDiaryPage の入力 */
export const diaryPageInputSchema = z.object({
    date: diaryDateSchema,
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

/** /diary/$date の 1 画面分のデータ (getDiaryPage の結果) */
export interface DiaryPageData {
    /** 開いた日のダイアリー */
    result: DiaryDayResult;
    /** 帯の範囲で日記のある日 (新しい順)。一覧を取れなかったときは null */
    existingDates: string[] | null;
    /** いちばん新しい日記の日。まだ無い・取れないときは null */
    latestDate: string | null;
}
