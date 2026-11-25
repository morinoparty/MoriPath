import { toDiaryEntries } from "@/routes/_signed_in/-functions/to-diary-entries";
import type { DiaryDocument } from "@/routes/_signed_in/-types/diary";
import { samplePlayers } from "./sample-players";

const { nikomaru, chocolatt, kina1120, tututututu201, hikighaL } =
    samplePlayers;

// ダイアリー API の players の形 (uuid は解決できたときだけ入る)
const withUuid = (player: { id: string; name: string }) => ({
    name: player.name,
    uuid: player.id,
});

/** ダイアリー API が返すドキュメントの例。表示が日によって変わらないよう日付を固定する */
export const sampleDiaryDocument: DiaryDocument = {
    version: 1,
    date: "2026-11-25",
    generatedAt: "2026-11-25T23:00:12.345Z",
    isFinalized: false,
    summary: null,
    entries: [
        {
            hour: 4,
            content: "穏やかな時間が流れていました",
            messageCount: 3,
            players: [withUuid(nikomaru), withUuid(chocolatt)],
        },
        // 誰もいなかった時間は本文が空で届き、タイムラインには出ない
        { hour: 5, content: "", messageCount: 0, players: [] },
        {
            hour: 6,
            content: "一番鶏が鳴いて、畑に人が集まりはじめました",
            messageCount: 8,
            players: [],
        },
        {
            hour: 7,
            content: "朝ごはんの支度で、村がにぎやかになりました",
            messageCount: 15,
            players: [
                withUuid(kina1120),
                withUuid(hikighaL),
                withUuid(chocolatt),
                withUuid(nikomaru),
                withUuid(tututututu201),
            ],
        },
        {
            hour: 8,
            content: "みんなで森の奥へ探検に出かけました",
            messageCount: 21,
            // uuid を解決できなかったプレイヤーは名前だけで届く
            players: [withUuid(kina1120), { name: hikighaL.name }],
        },
    ],
};

/** 画面に出すダイアリーの例 (本文のある時間だけ) */
export const sampleDiaryEntries = toDiaryEntries(sampleDiaryDocument);
