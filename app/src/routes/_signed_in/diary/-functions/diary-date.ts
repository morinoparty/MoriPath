import type { DiaryStripDay } from "../-types/diary-day";

const DAY_MS = 24 * 60 * 60 * 1000;
// ダイアリーのタームは日本時間の 4 時に始まる (0〜3 時は前日のターム)
const TERM_OFFSET_MS = (9 - 4) * 60 * 60 * 1000;

/** 日付の帯に並べる日数 */
export const DIARY_STRIP_LENGTH = 14;
// 古い日を選んだとき、帯の右側に残す日数 (選んだ日を端に寄せない)
const STRIP_TRAILING_DAYS = 3;

/** YYYY-MM-DD を UTC の 0 時として読む。日付だけを扱うのでタイムゾーンの影響を受けない */
const parseDate = (date: string): Date => new Date(`${date}T00:00:00Z`);

const toDateString = (date: Date): string => date.toISOString().slice(0, 10);

/** いまのターム (日本時間で 4 時に切り替わる日付) */
export const toDiaryTermDate = (now: Date): string =>
    toDateString(new Date(now.getTime() + TERM_OFFSET_MS));

/** 日付を days 日ずらす */
export const addDays = (date: string, days: number): string =>
    toDateString(new Date(parseDate(date).getTime() + days * DAY_MS));

/** a から b までの日数 (b が後なら正) */
const daysBetween = (a: string, b: string): number =>
    Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / DAY_MS);

/**
 * 日付の帯の最後の日。選んだ日が最近なら今日まで並べ、
 * 遡ったときは選んだ日が帯に入るよう、その数日先までにする
 */
export const diaryStripEnd = (selected: string, today: string): string => {
    if (daysBetween(selected, today) < DIARY_STRIP_LENGTH) {
        return today;
    }
    return addDays(selected, STRIP_TRAILING_DAYS);
};

const weekdayFormat = new Intl.DateTimeFormat("ja-JP", {
    weekday: "short",
    timeZone: "UTC",
});

/**
 * 日付の帯に並べる日を古い順に作る。
 * existingDates が null (日記のある日を取れなかった) なら hasDiary は null にする
 */
export const buildDiaryStripDays = ({
    selected,
    today,
    existingDates,
}: {
    selected: string;
    today: string;
    existingDates: string[] | null;
}): DiaryStripDay[] => {
    const end = diaryStripEnd(selected, today);
    const existing = existingDates ? new Set(existingDates) : null;
    return Array.from({ length: DIARY_STRIP_LENGTH }, (_, index) => {
        const date = addDays(end, index - DIARY_STRIP_LENGTH + 1);
        const day = parseDate(date);
        return {
            date,
            dayOfMonth: day.getUTCDate(),
            weekday: weekdayFormat.format(day),
            isToday: date === today,
            hasDiary: existing ? existing.has(date) : null,
        };
    });
};

const labelFormat = new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
});
const labelWithYearFormat = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
});

/** 見出しの日付 (「11月25日(水)」)。今年でなければ年も付ける */
export const formatDiaryDate = (date: string, today: string): string => {
    const format =
        date.slice(0, 4) === today.slice(0, 4)
            ? labelFormat
            : labelWithYearFormat;
    return format.format(parseDate(date));
};
