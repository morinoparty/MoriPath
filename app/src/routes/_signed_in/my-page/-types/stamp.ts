import { z } from "zod";

/** MineStamp のスタンプ 1 件 (API の形)。未知の種類が増えても parse で落とさないよう type は文字列で受ける */
export const stampResponseItemSchema = z.object({
    shortCode: z.string().min(1),
    type: z.string(),
});

/** GET /api/v1/plugins/minestamp/stamps/all の応答 */
export const allStampsResponseSchema = z.object({
    stamps: z.array(stampResponseItemSchema),
});

/** GET /api/v1/plugins/minestamp/stamps の応答 (ログイン中のプレイヤーのスタンプ) */
export const playerStampsResponseSchema = z.object({
    uuid: z.string(),
    stamps: z.array(stampResponseItemSchema),
});

export type StampResponseItem = z.infer<typeof stampResponseItemSchema>;

/** 画面で扱うスタンプの種類。絵文字か、サーバーに置かれた画像か */
export type StampType = "EMOJI" | "IMAGE";

/** 画面に出すスタンプ */
export interface Stamp {
    /** MineStamp の shortCode (例: ":1st-place-medal:", "!moripa_pink.png") */
    shortCode: string;
    type: StampType;
    /** 絵文字スタンプの字形。対応表に無ければ省く */
    emoji?: string;
    /** 読み上げとツールチップに使う名前 (例: "ピザ", "moripa_pink") */
    label: string;
}

/** 生成済みの対応表 (stamp-emoji.gen.json) の 1 件 */
export interface StampEmojiEntry {
    /** 完全修飾の字形 */
    emoji: string;
    /** よく使われる順の並び順。小さいほど先に並べる */
    sortIndex: number;
    /** emojibase の日本語名 (無ければ英語名) */
    label: string;
}

/** スタンプ帳の表示に必要なデータ */
export interface MyStamps {
    /** 持っているスタンプ (画像スタンプ → よく使われる絵文字の順) */
    owned: Stamp[];
    /** サーバーにあるスタンプの総数 */
    total: number;
}
