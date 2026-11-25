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

/** 日が締まったあとの 1 日分 (まとめ付き、朝から翌日の夜中まで) */
export const sampleFinalizedDiaryDocument: DiaryDocument = {
    version: 1,
    date: "2026-11-24",
    generatedAt: "2026-11-24T19:00:08.000Z",
    isFinalized: true,
    summary:
        "朝は畑仕事、昼は森の奥への探検、夜はみんなで花火を見て過ごした一日でした",
    entries: [
        {
            hour: 6,
            content: "朝露の残る畑で、かぼちゃの収穫がはじまりました",
            messageCount: 6,
            players: [withUuid(nikomaru)],
        },
        {
            hour: 9,
            content: "パン屋の前に行列ができていました",
            messageCount: 11,
            players: [withUuid(chocolatt), withUuid(kina1120)],
        },
        {
            hour: 13,
            content: "森の奥で古い遺跡が見つかり、みんなで調べに行きました",
            messageCount: 34,
            players: [
                withUuid(nikomaru),
                withUuid(chocolatt),
                withUuid(tututututu201),
                withUuid(hikighaL),
            ],
        },
        {
            hour: 17,
            content: "夕焼けの丘で、釣りの腕くらべが開かれました",
            messageCount: 18,
            players: [withUuid(kina1120), withUuid(tututututu201)],
        },
        {
            hour: 21,
            content: "広場で花火が上がり、たくさんの人が見に来ました",
            messageCount: 42,
            players: [
                withUuid(nikomaru),
                withUuid(chocolatt),
                withUuid(kina1120),
                withUuid(tututututu201),
                withUuid(hikighaL),
            ],
        },
        // 0〜3 時は前の日のタームの夜に入る
        {
            hour: 1,
            content: "夜ふかし組が、静かに整地を続けていました",
            messageCount: 4,
            players: [withUuid(hikighaL)],
        },
    ],
};
