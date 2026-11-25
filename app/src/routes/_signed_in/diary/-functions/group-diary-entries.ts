import type { DiaryEntry } from "../../-types/diary";
import type { DiaryEntryGroup } from "../-types/diary-day";

// タームは 4 時に始まり、0〜3 時は前の日の夜の続きになる
const TERM_START_HOUR = 4;

// タームの順に並べた時間帯。from 時から until 時の手前まで (0〜3 時は 24〜27 時として扱う)
const GROUPS: {
    id: DiaryEntryGroup["id"];
    label: string;
    from: number;
    until: number;
}[] = [
    { id: "morning", label: "朝", from: 4, until: 10 },
    { id: "daytime", label: "昼", from: 10, until: 16 },
    { id: "evening", label: "夕方", from: 16, until: 19 },
    { id: "night", label: "夜", from: 19, until: 24 + TERM_START_HOUR },
];

/** タームの中での時。entry.time は +09:00 付きの ISO 8601 なので、そのまま日本時間の時を読む */
const termHourOf = (entry: DiaryEntry): number => {
    const hour = Number(entry.time.slice(11, 13));
    return hour < TERM_START_HOUR ? hour + 24 : hour;
};

/** タイムラインを朝・昼・夕方・夜に分ける。出来事の無い時間帯は出さない */
export const groupDiaryEntries = (entries: DiaryEntry[]): DiaryEntryGroup[] =>
    GROUPS.map((group) => ({
        id: group.id,
        label: group.label,
        entries: entries.filter((entry) => {
            const hour = termHourOf(entry);
            return hour >= group.from && hour < group.until;
        }),
    })).filter((group) => group.entries.length > 0);
