import { cx, sva } from "../../../../../../styled-system/css";
import { formatNumber } from "../../../../../lib/format-number";
import type { ClaimPurchaseQuote } from "../../-types/claim-purchase";

const costCardStyle = sva({
    slots: [
        "root",
        "row",
        "totalLabel",
        "total",
        "unitRow",
        "afterLabel",
        "afterRow",
        "afterValue",
    ],
    base: {
        // 枠線と影を持たない面のカード
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "3",
            width: "full",
            padding: "4",
            bg: "colorPalette.surface.subtle",
            borderRadius: "panel",
        },
        row: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "3",
            lineHeight: "1.5",
            whiteSpace: "nowrap",
        },
        totalLabel: {
            fontSize: "14px",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
        },
        total: {
            fontSize: "18px",
            fontWeight: "bold",
            fontVariantNumeric: "tabular-nums",
            color: "colorPalette.fg",
        },
        unitRow: {
            fontSize: "12px",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
        },
        // 「買ったあと」の見出しの上だけ、行の間より少し広く空ける
        afterLabel: {
            marginTop: "1",
            fontSize: "12px",
            fontWeight: "medium",
            lineHeight: "1.5",
            color: "colorPalette.fg.muted",
            "&[data-first]": { marginTop: "0" },
        },
        afterRow: {
            fontSize: "14px",
            fontWeight: "medium",
            color: "colorPalette.fg",
        },
        afterValue: {
            fontWeight: "bold",
            fontVariantNumeric: "tabular-nums",
            // 残高が足りないときは、足りなくなる値を危険の色にする
            "&[data-insufficient]": { color: "fg.error" },
        },
    },
});

export interface CostCardProps {
    /** いまの保護ブロック。取れなかったときは null */
    remainingClaimBlocks: number | null;
    /** いまの残高。取れなかったときは null */
    balance: number | null;
    /** 1 ブロックのどんぐり。分からなければ null */
    unitPrice: number | null;
    /** 選んだ数での合計と、買ったあとの値 */
    quote: ClaimPurchaseQuote;
}

/**
 * 合計と、買ったあとの保護ブロック・残高を出すカード。
 * 単価や残高が分からない行は出さず、どの行も出せないときはカードごと出さない
 */
export const CostCard = ({
    remainingClaimBlocks,
    balance,
    unitPrice,
    quote,
}: CostCardProps) => {
    const style = costCardStyle();
    const hasTotal = quote.totalCost !== null && unitPrice !== null;
    const blocksAfter =
        remainingClaimBlocks !== null && quote.blocksAfter !== null
            ? { from: remainingClaimBlocks, to: quote.blocksAfter }
            : null;
    const balanceAfter =
        balance !== null && quote.balanceAfter !== null
            ? { from: balance, to: quote.balanceAfter }
            : null;
    const hasAfter = blocksAfter !== null || balanceAfter !== null;

    if (!hasTotal && !hasAfter) {
        return null;
    }

    return (
        <section className={style.root} aria-label="支払い">
            {hasTotal && (
                <>
                    <div className={style.row}>
                        {/* 単価は設定の値でサーバーとずれうるため目安とする */}
                        <span className={style.totalLabel}>合計の目安</span>
                        <span className={style.total}>
                            {formatNumber(quote.totalCost ?? 0)} どんぐり
                        </span>
                    </div>
                    <div className={cx(style.row, style.unitRow)}>
                        <span>1 ブロック</span>
                        <span>{formatNumber(unitPrice ?? 0)} どんぐり</span>
                    </div>
                </>
            )}
            {hasAfter && (
                <>
                    {/* 合計が無いときは見出しの上の余白を足さない */}
                    <span
                        className={style.afterLabel}
                        data-first={hasTotal ? undefined : ""}
                    >
                        買ったあと
                    </span>
                    {blocksAfter && (
                        <div className={cx(style.row, style.afterRow)}>
                            <span>保護ブロック</span>
                            <span className={style.afterValue}>
                                {formatNumber(blocksAfter.from)} →{" "}
                                {formatNumber(blocksAfter.to)}
                            </span>
                        </div>
                    )}
                    {balanceAfter && (
                        <div className={cx(style.row, style.afterRow)}>
                            <span>どんぐり</span>
                            <span
                                className={style.afterValue}
                                data-insufficient={
                                    quote.isInsufficient ? "" : undefined
                                }
                            >
                                {formatNumber(balanceAfter.from)} →{" "}
                                {formatNumber(balanceAfter.to)}
                            </span>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};
