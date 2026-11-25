import { z } from "zod";

/** ダイアリー API のプレイヤー。uuid は Bot が mc-api で解決できたときだけ入る */
const diaryResponsePlayerSchema = z.object({
    name: z.string().min(1),
    uuid: z.string().min(1).optional(),
});

/** ダイアリー API の 1 時間ぶんの記録 */
const diaryResponseEntrySchema = z.object({
    /** 日本時間の時 (0-23) */
    hour: z.int().min(0).max(23),
    /** Discord 向けの本文 (Markdown)。text が無いときだけ使う */
    content: z.string(),
    /** 画面にそのまま出せる短い一言 (Markdown なし)。古い diary-api は返さない */
    text: z.string().optional(),
    /** content から Markdown を外した全文。古い diary-api は返さない */
    fullText: z.string().optional(),
    messageCount: z.int().min(0),
    players: z.array(diaryResponsePlayerSchema),
});

/** GET /v1/diaries/latest・/v1/diaries/:date の応答 (moritopa の diary-api と同じ形) */
export const diaryDocumentSchema = z.object({
    version: z.literal(1),
    /** ターム (04:00 JST 〜 翌 03:59 JST) の開始日 YYYY-MM-DD */
    date: z.iso.date(),
    generatedAt: z.iso.datetime({ offset: true }),
    isFinalized: z.boolean(),
    summary: z.string().nullish(),
    /** summary から Markdown を外したもの。古い diary-api は返さない */
    summaryText: z.string().nullish(),
    /** タームの順 (4 時 → 翌 3 時) に並ぶ。中身の無い時間を含むことがある */
    entries: z.array(diaryResponseEntrySchema),
});

export type DiaryDocument = z.infer<typeof diaryDocumentSchema>;

/** ダイアリーに登場するプレイヤー (PlayerAvatarGroup の players にそのまま渡せる形) */
export interface DiaryPlayer {
    /** UUID (ハイフン区切り)。解決できなかったプレイヤーは名前 */
    id: string;
    name: string;
}

/** 「きょうのもりぱダイアリー」の 1 件 */
export interface DiaryEntry {
    id: string;
    /** 出来事の時刻 (ISO 8601、+09:00 付き) */
    time: string;
    /** 出来事の本文 */
    description: string;
    /** その出来事に居合わせたプレイヤー。いなければ空配列 */
    players: DiaryPlayer[];
}
