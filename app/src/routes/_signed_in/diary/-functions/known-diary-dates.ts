import type { DiaryPageData } from "../-types/diary-day";

/** 日付の移動と帯に使う、日記のある日の情報 */
export interface KnownDiaryDates {
    /** 帯の範囲で日記のある日。まだ分からなければ null */
    existingDates: string[] | null;
    /** いちばん新しい日記の日。まだ分からなければ null */
    latestDate: string | null;
}

// ブラウザで最後に取れた値。日を移る間、帯の印や「次の日」を前の画面のまま保つために使う。
// 帯の範囲 (最後の日) ごとに一覧が違うため、範囲の最後の日を key にする
const existingDatesByStripEnd = new Map<string, string[]>();
let latestDate: string | null = null;

// サーバーではリクエストをまたいで持たない (描画はブラウザと同じ「まだ分からない」から始める)
const isBrowser = () => typeof document !== "undefined";

/** 取れた 1 画面分の値を覚える */
export const rememberDiaryDates = (
    stripEnd: string,
    page: DiaryPageData,
): void => {
    if (!isBrowser()) {
        return;
    }
    if (page.existingDates) {
        existingDatesByStripEnd.set(stripEnd, page.existingDates);
    }
    if (page.latestDate) {
        latestDate = page.latestDate;
    }
};

/** その帯の範囲で、これまでに分かっている値 */
export const readKnownDiaryDates = (stripEnd: string): KnownDiaryDates => {
    if (!isBrowser()) {
        return { existingDates: null, latestDate: null };
    }
    return {
        existingDates: existingDatesByStripEnd.get(stripEnd) ?? null,
        latestDate,
    };
};
