import { Button } from "@morinoparty/chlorophyll-react/components";
import { Link } from "@tanstack/react-router";
import { sva } from "../../../../../../styled-system/css";
import { SubPageBar } from "../../../../../components/sub-page-bar";
import { formatNumber } from "../../../../../lib/format-number";
import type {
    ClaimPurchaseFailure,
    ClaimPurchaseQuote,
    ClaimPurchaseResult,
} from "../../-types/claim-purchase";
import { ClaimConfirmDialog } from "../claim-confirm-dialog";
import { ClaimSummary } from "../claim-summary";
import { CostCard } from "../cost-card";
import { PurchaseResult } from "../purchase-result";
import { QuantityPicker } from "../quantity-picker";

// 戻るボタンと「もどる」の行き先 (保護ブロックを買う行のあるマイページ)
const BACK_TO = "/my-page";

const claimPurchaseStyle = sva({
    slots: ["root", "spacer", "actions", "error"],
    base: {
        // 買うボタンを画面の下端に置くため、画面の高さいっぱいの縦並びにする
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "5",
            minHeight: "100dvh",
            paddingX: "6",
            paddingTop: "4",
            paddingBottom:
                "max({spacing.6}, calc(env(safe-area-inset-bottom) + {spacing.2}))",
            bg: "colorPalette.bg",
        },
        spacer: {
            flex: "1",
        },
        actions: {
            display: "flex",
            flexDirection: "column",
            gap: "2",
            width: "full",
        },
        error: {
            fontSize: "14px",
            fontWeight: "medium",
            lineHeight: "1.5",
            textAlign: "center",
            color: "fg.error",
        },
    },
});

export interface ClaimPurchaseViewProps {
    /** いまの残高。取れなかったときは null */
    balance: number | null;
    /** いまの保護ブロック。取れなかったときは null */
    remainingClaimBlocks: number | null;
    /** 1 ブロックのどんぐり。分からなければ null */
    unitPrice: number | null;
    /** 買うブロック数 */
    count: number;
    /** 残高で買える最大のブロック数。分からなければ null */
    maxBlocks: number | null;
    /** 選んだ数での合計と、買ったあとの値 */
    quote: ClaimPurchaseQuote;
    /** 買うボタンを押せるか */
    canPurchase: boolean;
    isPurchasing: boolean;
    /** 買ったあとに値を取り直しているあいだ。数を変えさせない */
    isRefreshing?: boolean;
    /** 確認ダイアログを開いているか */
    isConfirming: boolean;
    failure: ClaimPurchaseFailure | null;
    /** 買い終わったときの結果。入っていれば完了の表示にする */
    result: ClaimPurchaseResult | null;
    onCountChange: (count: number) => void;
    onAdd: (delta: number) => void;
    onFillMax: () => void;
    /** 買うボタンを押したとき (確認ダイアログを開く) */
    onRequestConfirm: () => void;
    onCancelConfirm: () => void;
    /** 確認ダイアログで「買う」を押したとき */
    onConfirmPurchase: () => void;
    onPurchaseAgain: () => void;
}

/** 保護ブロックを買う画面。いまの数、買う数、支払い、買うボタンを縦に並べる */
export const ClaimPurchaseView = ({
    balance,
    remainingClaimBlocks,
    unitPrice,
    count,
    maxBlocks,
    quote,
    canPurchase,
    isPurchasing,
    isRefreshing = false,
    isConfirming,
    failure,
    result,
    onCountChange,
    onAdd,
    onFillMax,
    onRequestConfirm,
    onCancelConfirm,
    onConfirmPurchase,
    onPurchaseAgain,
}: ClaimPurchaseViewProps) => {
    const style = claimPurchaseStyle();

    if (result) {
        return (
            <div className={style.root}>
                <SubPageBar title="保護ブロックを買う" backTo={BACK_TO} />
                {/* 上下の余白で結果を画面の中ほどに置く */}
                <div className={style.spacer} />
                <PurchaseResult result={result} />
                <div className={style.spacer} />
                <div className={style.actions}>
                    <Button asChild size="lg" intent="primary">
                        <Link to={BACK_TO}>もどる</Link>
                    </Button>
                    <Button size="lg" intent="plain" onClick={onPurchaseAgain}>
                        続けて買う
                    </Button>
                </div>
            </div>
        );
    }

    const buttonLabel = (() => {
        if (isPurchasing) {
            return "買っています…";
        }
        if (quote.isInsufficient || maxBlocks === 0) {
            return "どんぐりが足りません";
        }
        return `${formatNumber(count)} ブロックを買う`;
    })();

    return (
        <div className={style.root}>
            <SubPageBar title="保護ブロックを買う" backTo={BACK_TO} />
            <ClaimSummary
                remainingClaimBlocks={remainingClaimBlocks}
                balance={balance}
            />
            <QuantityPicker
                count={count}
                maxBlocks={maxBlocks}
                onCountChange={onCountChange}
                onAdd={onAdd}
                onFillMax={onFillMax}
                disabled={isPurchasing || isRefreshing || isConfirming}
            />
            <CostCard
                remainingClaimBlocks={remainingClaimBlocks}
                balance={balance}
                unitPrice={unitPrice}
                quote={quote}
            />
            <div className={style.spacer} />
            <div className={style.actions}>
                <Button
                    size="lg"
                    intent="primary"
                    onClick={onRequestConfirm}
                    disabled={!canPurchase || isPurchasing || isRefreshing}
                    aria-busy={isPurchasing || undefined}
                >
                    {buttonLabel}
                </Button>
                {/* ダイアログを閉じたあとも、失敗の案内は買うボタンの下に残す */}
                {failure && !isConfirming && (
                    <p className={style.error} role="alert">
                        {failure.message}
                    </p>
                )}
            </div>
            <ClaimConfirmDialog
                open={isConfirming}
                count={count}
                quote={quote}
                balance={balance}
                isPurchasing={isPurchasing}
                failure={failure}
                onConfirm={onConfirmPurchase}
                onCancel={onCancelConfirm}
            />
        </div>
    );
};
