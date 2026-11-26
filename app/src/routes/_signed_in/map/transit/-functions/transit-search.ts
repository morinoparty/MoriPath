import { z } from "zod";
import type {
    SlotLabel,
    TransitMode,
    TransitNetworkIndex,
    TransitSlot,
} from "../-types/transit";

/**
 * 駅・路線の slug の形。URL の search と経路検索の Server Function の両方でこれを使う。
 * プラグインの IdValidation と同じ形に、長さの上限を足したもの (大文字・小文字はそのまま)
 */
export const stationSlugSchema = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);

// ルーターは数字だけの値を数値にするので文字列に戻す。形が合わなければ未指定にする
const slugSchema = z.coerce
    .string()
    .pipe(stationSlugSchema)
    .optional()
    .catch(undefined);

/** 枠の表示名 */
export const slotLabel: Record<TransitSlot, SlotLabel> = {
    from: "出発",
    to: "到着",
};

// 検索語の最大文字数 (URL が伸びすぎないようにする)
const QUERY_MAX_LENGTH = 40;

/** 乗換案内の URL の search。再読み込みや戻るで状態が残るよう、すべて URL に持つ */
export const transitSearchSchema = z.object({
    // 出発駅 slug
    from: slugSchema,
    // 到着駅 slug
    to: slugSchema,
    // 選び直している枠
    slot: z.enum(["from", "to"]).optional().catch(undefined),
    // 未指定 = line
    mode: z.enum(["line", "search"]).optional().catch(undefined),
    // 開いている路線 (group slug)
    line: slugSchema,
    q: z.coerce
        .string()
        .transform((value) => value.slice(0, QUERY_MAX_LENGTH))
        .optional()
        .catch(undefined),
});

export type TransitSearch = z.infer<typeof transitSearchSchema>;

// slug が指定されていて、索引にも駅があるか
const isDecided = (slug: string | undefined, index: TransitNetworkIndex) =>
    slug !== undefined && index.stationBySlug.has(slug);

/** 表示するモード (未指定は "line") */
export const modeOf = (search: TransitSearch): TransitMode =>
    search.mode ?? "line";

/** いま選んでいる枠。slot 指定があればそれ。無ければ 出発が未決→"from"、到着が未決→"to"、両方決まっていれば null (経路を出す) */
export const resolveActiveSlot = (
    search: TransitSearch,
    index: TransitNetworkIndex,
): TransitSlot | null => {
    if (search.slot !== undefined) return search.slot;
    if (!isDecided(search.from, index)) return "from";
    if (!isDecided(search.to, index)) return "to";
    return null;
};

/** 枠に駅を入れる。もう一方が未決ならそちらへ進み、両方決まれば slot を外す (経路を出す)。q は消し、mode と line は残す */
export const chooseStation = (
    search: TransitSearch,
    index: TransitNetworkIndex,
    slot: TransitSlot,
    slug: string,
): TransitSearch => {
    const next: TransitSearch = { ...search, [slot]: slug, q: undefined };
    const other: TransitSlot = slot === "from" ? "to" : "from";
    // もう一方がまだ決まっていなければ、続けてそちらを選ぶ
    next.slot = isDecided(next[other], index) ? undefined : other;
    return next;
};

/**
 * 出発と到着を入れかえる。選んでいる枠も一緒に入れかえ、
 * 入れかえる前に選んでいた (空の、または選び直している) 駅をそのまま選び続ける
 */
export const swapStations = (search: TransitSearch): TransitSearch => ({
    ...search,
    from: search.to,
    to: search.from,
    slot:
        search.slot === "from"
            ? "to"
            : search.slot === "to"
              ? "from"
              : undefined,
});

/** 枠をタップしたとき。その枠を選び直す状態にする */
export const editSlot = (
    search: TransitSearch,
    slot: TransitSlot,
): TransitSearch => ({ ...search, slot });

/** モード切り替え。line と q は残す */
export const changeMode = (
    search: TransitSearch,
    mode: TransitMode,
): TransitSearch => ({ ...search, mode });

/** 路線を開く/閉じる (undefined で一覧に戻る) */
export const openLine = (
    search: TransitSearch,
    lineSlug: string | undefined,
): TransitSearch => ({ ...search, line: lineSlug });

/** 検索語 (空文字は undefined) */
export const changeQuery = (
    search: TransitSearch,
    q: string,
): TransitSearch => ({
    ...search,
    q: q === "" ? undefined : q.slice(0, QUERY_MAX_LENGTH),
});
