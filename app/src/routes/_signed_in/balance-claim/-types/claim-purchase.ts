/** 保護ブロックを買い終わったときの結果。値はすべて API が返したもの */
export interface ClaimPurchaseResult {
    /** 買えたブロック数 */
    purchased: number;
    /** 使ったどんぐり */
    totalCost: number;
    /** 買ったあとの残高 (整数に丸めた値) */
    balance: number;
    /** 買ったあとの保護ブロック */
    remainingClaimBlocks: number;
}

/**
 * 購入に失敗したときの内容。
 * rejected は API がはっきり断ったもの、unknown は買えたかどうか分からないもの (通信エラーや 5xx)
 */
export interface ClaimPurchaseFailure {
    kind: "rejected" | "unknown";
    message: string;
}

/** 購入のサーバー関数の戻り値。失敗も例外にせず種類つきで返す */
export type PurchaseClaimBlocksResult =
    | ({ ok: true } & ClaimPurchaseResult)
    | ({ ok: false } & ClaimPurchaseFailure);

/** 買う前に見せる金額と、買ったあとの値。単価や残高が分からない項目は null */
export interface ClaimPurchaseQuote {
    /** 合計のどんぐり。単価が分からなければ null */
    totalCost: number | null;
    /** 買ったあとの保護ブロック。いまの数が分からなければ null */
    blocksAfter: number | null;
    /** 買ったあとの残高。単価か残高が分からなければ null */
    balanceAfter: number | null;
    /** 残高が合計に足りないか (分からないときは false にして、判断を API に任せる) */
    isInsufficient: boolean;
}
