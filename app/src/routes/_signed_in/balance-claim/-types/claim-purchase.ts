/**
 * 保護ブロックを買い終わったときの結果。値は API が返したもの。
 * 2xx でも応答が読めなかったときは、買った数だけ頼んだ数で埋め、ほかは null にする
 */
export interface ClaimPurchaseResult {
    /** 買えたブロック数 */
    purchased: number;
    /** 使ったどんぐり。応答が読めなければ null */
    totalCost: number | null;
    /** 買ったあとの残高 (小数を切り捨てた値)。応答が読めなければ null */
    balance: number | null;
    /** 買ったあとの保護ブロック。応答が読めなければ null */
    remainingClaimBlocks: number | null;
}

/**
 * 購入に失敗したときの内容。
 * rejected は API がはっきり断ったもの、unknown は買えたかどうか分からないもの (通信エラーや 5xx)。
 * unknown のあいだは二重購入を避けるため、数を選び直すまで買わせない
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
