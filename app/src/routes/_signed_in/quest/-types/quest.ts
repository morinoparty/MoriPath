import { z } from "zod";

// MineAuth は null のフィールドを JSON に出さないため、無いキーも null として受ける
const nullable = <T extends z.ZodType>(schema: T) =>
    schema.nullish().transform((value) => value ?? null);

/** 受注できる難易度 (並び順もこの順) */
export const ORDERABLE_DIFFICULTIES = ["easy", "normal", "hard"] as const;

/** 受注できる難易度 */
export type OrderableDifficulty = (typeof ORDERABLE_DIFFICULTIES)[number];

/** クエストの難易度。event はまだ配信されていないが、届いても表示できるようにしておく */
export type QuestDifficulty = OrderableDifficulty | "event" | "unknown";

/** デイリークエストのプラグイン (GET /api/v1/plugins/dailyquest/daily-quests/me) の 1 件 */
export const dailyQuestInfoSchema = z.object({
    slot: z.number().int(),
    questId: z.string(),
    // 新しい難易度が増えても画面を壊さないよう、知らない値は unknown として受ける
    difficulty: z
        .enum(["easy", "normal", "hard", "event", "unknown"])
        .catch("unknown"),
    rarity: nullable(z.string()),
    title: z.string(),
    objective: z.string(),
    taskCompleted: z.boolean(),
    questCompleted: z.boolean(),
    progressPercentage: z.number(),
    totalAmount: nullable(z.number()),
    currentAmount: nullable(z.number()),
});

/** デイリークエストのプラグインのレスポンス */
export const dailyQuestResponseSchema = z.object({
    ordered: z.boolean(),
    online: z.boolean(),
    rerollCharges: z.number().int(),
    dailyQuests: z.array(dailyQuestInfoSchema),
});

export type DailyQuestResponse = z.infer<typeof dailyQuestResponseSchema>;

/** クエストの進み具合 */
export type QuestStatus =
    /** 目標に向けて進めているところ */
    | "active"
    /** 目標を達成し、受付嬢への報告 (報酬の受け取り) を待っている */
    | "reportable"
    /** 報酬を受け取り済み */
    | "completed";

/** 画面に出すクエスト 1 件 */
export interface DailyQuest {
    /** 受注枠の番号。React の key にも使う */
    slot: number;
    difficulty: QuestDifficulty;
    /** Hard のレア度 (common / rare / very_rare)。Hard 以外は null */
    rarity: string | null;
    title: string;
    /** 何をすればよいか (説明文の最初の段落) */
    objective: string;
    status: QuestStatus;
    /** 進捗率 (0〜100) */
    progressPercentage: number;
    /** いまの達成数。分からなければ null */
    currentAmount: number | null;
    /** 達成に必要な数。分からなければ null */
    totalAmount: number | null;
}

/** クエストのページに出す、その日のデイリークエストの状況 */
export interface QuestBoard {
    /** その日のクエストを受けているか。false の間は難易度を選んでもらう */
    ordered: boolean;
    /** サーバーにいるか。受注・リロールはサーバーにいるときだけできる */
    online: boolean;
    /** リロールできる残り回数 */
    rerollCharges: number;
    /** 受けているクエスト (受注枠の順) */
    quests: DailyQuest[];
}

/** 受注・リロールの結果。失敗のときは画面に出す一言を持つ */
export type QuestActionResult = { ok: true } | { ok: false; message: string };
