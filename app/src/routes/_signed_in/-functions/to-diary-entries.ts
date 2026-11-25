import type { DiaryDocument, DiaryEntry, DiaryPlayer } from "../-types/diary";

/** タームは 4 時に始まり、0〜3 時は翌日の日付になる */
const TERM_START_HOUR = 4;

/** YYYY-MM-DD の翌日。日付だけを扱うので UTC で計算してタイムゾーンの影響を受けないようにする */
const nextDate = (date: string): string => {
    const day = new Date(`${date}T00:00:00Z`);
    day.setUTCDate(day.getUTCDate() + 1);
    return day.toISOString().slice(0, 10);
};

/** タームの開始日と時 (JST) から、その時間の始まりの ISO 8601 (+09:00) を作る */
const toEntryTime = (termDate: string, hour: number): string => {
    const date = hour < TERM_START_HOUR ? nextDate(termDate) : termDate;
    return `${date}T${String(hour).padStart(2, "0")}:00:00+09:00`;
};

/** UUID があれば顔の取得に使い、無ければ名前で代用する。同じプレイヤーは 1 回だけ並べる */
const toDiaryPlayers = (
    players: DiaryDocument["entries"][number]["players"],
): DiaryPlayer[] => {
    const byId = new Map<string, DiaryPlayer>();
    for (const player of players) {
        const id = player.uuid ?? player.name;
        // PlayerAvatarGroup は id を key に使うため重複を除く
        if (!byId.has(id)) {
            byId.set(id, { id, name: player.name });
        }
    }
    return [...byId.values()];
};

/** ダイアリー API のドキュメントを、本文のある時間だけのタイムライン (タームの順) にする */
export const toDiaryEntries = (document: DiaryDocument): DiaryEntry[] =>
    document.entries
        // 誰もいなかった時間などは本文が空なので出さない
        .filter((entry) => entry.content.trim() !== "")
        .map((entry) => ({
            id: `${document.date}-${entry.hour}`,
            time: toEntryTime(document.date, entry.hour),
            description: entry.content.trim(),
            players: toDiaryPlayers(entry.players),
        }));
