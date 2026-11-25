import type { DiaryEntry, DiaryPlayer } from "../-types/diary";

// 仮データに登場するプレイヤー
const nikomaru: DiaryPlayer = {
    id: "f8b761ec-4a54-48eb-a040-c5604042bcc9",
    name: "_NIKOMARU",
};
const chocolatt: DiaryPlayer = {
    id: "389b1a68-f647-4dd0-a421-61b6c22fdebe",
    name: "Chocolatt",
};
const kina1120: DiaryPlayer = {
    id: "e31f4f1a-9c82-4f8b-b2af-8e1152719f73",
    name: "kina1120",
};
const tututututu201: DiaryPlayer = {
    id: "610fa9d7-4607-4d47-83fd-360f76192723",
    name: "tututututu201",
};
const hikighaL: DiaryPlayer = {
    id: "0ebbb0bf-f0d1-41a6-ac80-ca9b2f6df883",
    name: "hikighaL",
};

/** 日本時間での日付 (YYYY-MM-DD)。Workers は UTC で動くためタイムゾーンを明示する */
export const toTokyoDate = (now: Date): string =>
    // sv-SE ロケールは YYYY-MM-DD 形式で出力される
    now.toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });

/**
 * 「きょうのもりぱダイアリー」の仮データを作る。
 * TODO(#38): ダイアリーの API ができたら、この仮データを API の取得結果に置き換える
 */
export const buildPlaceholderDiary = (now: Date): DiaryEntry[] => {
    const date = toTokyoDate(now);
    // 時刻は日本時間で固定し、ISO 8601 (+09:00) で返す
    const at = (time: string) => `${date}T${time}:00+09:00`;

    return [
        {
            id: `${date}-0500`,
            time: at("05:00"),
            description: "穏やかな時間が流れていました",
            players: [nikomaru, chocolatt, kina1120, tututututu201, hikighaL],
        },
        {
            id: `${date}-0600`,
            time: at("06:00"),
            description: "一番鶏が鳴いて、畑に人が集まりはじめました",
            players: [],
        },
        {
            id: `${date}-0730`,
            time: at("07:30"),
            description: "朝ごはんの支度で、村がにぎやかになりました",
            players: [kina1120, hikighaL, chocolatt, nikomaru, tututututu201],
        },
    ];
};
