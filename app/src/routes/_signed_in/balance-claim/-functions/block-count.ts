import type { ClaimPurchaseQuote } from "../-types/claim-purchase";

/** 一度に買える最小のブロック数 */
export const MIN_BLOCK_COUNT = 1;
/** 一度に買える最大のブロック数。大きな数字の欄に収まる 6 けたまでにする */
export const MAX_BLOCK_COUNT = 999_999;
/** 画面を開いたときと「続けて買う」のあとのブロック数 */
export const DEFAULT_BLOCK_COUNT = 100;

/** ブロック数を 1 以上・上限以下の整数にそろえる。数でなければ最小値にする */
export const clampBlockCount = (value: number): number => {
    if (!Number.isFinite(value)) {
        return MIN_BLOCK_COUNT;
    }
    return Math.min(
        MAX_BLOCK_COUNT,
        Math.max(MIN_BLOCK_COUNT, Math.round(value)),
    );
};

/** 入力欄の文字からブロック数を読む。数字以外は捨て、空なら null */
export const parseBlockCountDraft = (text: string): number | null => {
    const digits = text.replace(/\D/g, "");
    return digits === "" ? null : Number(digits);
};

/**
 * 残高で買える最大のブロック数。単価か残高が分からなければ null。
 * 上限 (MAX_BLOCK_COUNT) を超える分は切り捨てる
 */
export const maxAffordableBlocks = (
    balance: number | null,
    unitPrice: number | null,
): number | null => {
    if (balance === null || unitPrice === null || unitPrice <= 0) {
        return null;
    }
    return Math.min(
        MAX_BLOCK_COUNT,
        Math.max(0, Math.floor(balance / unitPrice)),
    );
};

/** 買う前に見せる合計と、買ったあとの保護ブロック・残高を計算する */
export const quoteClaimPurchase = (
    count: number,
    current: {
        balance: number | null;
        remainingClaimBlocks: number | null;
        unitPrice: number | null;
    },
): ClaimPurchaseQuote => {
    const totalCost =
        current.unitPrice === null ? null : count * current.unitPrice;
    const balanceAfter =
        totalCost === null || current.balance === null
            ? null
            : current.balance - totalCost;
    return {
        totalCost,
        blocksAfter:
            current.remainingClaimBlocks === null
                ? null
                : current.remainingClaimBlocks + count,
        balanceAfter,
        isInsufficient: balanceAfter !== null && balanceAfter < 0,
    };
};

/** 画面の数字はロケールを固定して桁区切りする (SSR とブラウザでずれないように) */
export const formatNumber = (value: number): string =>
    value.toLocaleString("ja-JP");
