import {
    Button,
    Dialog,
    Portal,
} from "@morinoparty/chlorophyll-react/components";
import { useId } from "react";
import { sva } from "../../../../../../styled-system/css";
import { formatNumber } from "../../../../../lib/format-number";
import type {
    ClaimPurchaseFailure,
    ClaimPurchaseQuote,
} from "../../-types/claim-purchase";

const claimConfirmStyle = sva({
    slots: ["summary", "count", "unit", "cost", "note", "error"],
    base: {
        summary: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2",
            paddingY: "2",
            textAlign: "center",
        },
        count: {
            fontSize: "36px",
            fontWeight: "bold",
            lineHeight: "1.25",
            fontVariantNumeric: "tabular-nums",
            color: "colorPalette.fg",
        },
        unit: {
            marginLeft: "1",
            fontSize: "14px",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
        },
        cost: {
            fontSize: "14px",
            fontWeight: "medium",
            lineHeight: "1.5",
            fontVariantNumeric: "tabular-nums",
            color: "colorPalette.fg",
        },
        note: {
            fontSize: "13px",
            fontWeight: "medium",
            lineHeight: "1.5",
            color: "colorPalette.fg.muted",
        },
        error: {
            fontSize: "13px",
            fontWeight: "medium",
            color: "fg.error",
            textAlign: "center",
        },
    },
});

export interface ClaimConfirmDialogProps {
    open: boolean;
    /** 買うブロック数 */
    count: number;
    /** 選んだ数での合計と、買ったあとの値 (合計は設定の単価から出した目安) */
    quote: ClaimPurchaseQuote;
    /** いまの残高。取れていなければ買ったあとの残高を出さない */
    balance: number | null;
    /** 買っているあいだは閉じさせず、ボタンも押させない */
    isPurchasing: boolean;
    /** 買えなかったときの内容 */
    failure: ClaimPurchaseFailure | null;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * 買う前の確認。どんぐりが減るため、数と合計の目安を見せてから買う。
 * 単価が分からないときは、合計は買ったあとに分かることを伝える
 */
export const ClaimConfirmDialog = ({
    open,
    count,
    quote,
    balance,
    isPurchasing,
    failure,
    onConfirm,
    onCancel,
}: ClaimConfirmDialogProps) => {
    const style = claimConfirmStyle();
    // 誤って買わないよう、開いたときは「やめる」にフォーカスを置く
    const cancelId = useId();
    // 買えたか分からないときは、二重に買わないよう買うボタンを止める
    const canConfirm = !isPurchasing && failure?.kind !== "unknown";

    return (
        <Dialog.Root
            open={open}
            size="sm"
            role="alertdialog"
            onOpenChange={(details) => {
                if (!details.open) {
                    onCancel();
                }
            }}
            closeOnEscape={!isPurchasing}
            closeOnInteractOutside={!isPurchasing}
            initialFocusEl={() => document.getElementById(cancelId)}
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>この数を買いますか？</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <div className={style.summary}>
                                <p className={style.count}>
                                    {formatNumber(count)}
                                    <span className={style.unit}>ブロック</span>
                                </p>
                                {quote.totalCost === null ? (
                                    // 単価が分からないときは金額を出さず、買ったあとに分かることだけ伝える
                                    <p className={style.note}>
                                        使うどんぐりは買ったあとに表示します
                                    </p>
                                ) : (
                                    <>
                                        <p className={style.cost}>
                                            {/* 単価は設定の値でサーバーとずれうるため目安とし、実際の額は完了画面で出す */}
                                            合計の目安{" "}
                                            {formatNumber(
                                                Math.ceil(quote.totalCost),
                                            )}{" "}
                                            どんぐり
                                        </p>
                                        {balance !== null &&
                                            quote.balanceAfter !== null && (
                                                <p className={style.note}>
                                                    残高 {formatNumber(balance)}{" "}
                                                    →{" "}
                                                    {formatNumber(
                                                        Math.floor(
                                                            quote.balanceAfter,
                                                        ),
                                                    )}
                                                </p>
                                            )}
                                    </>
                                )}
                            </div>
                            {failure && (
                                <p className={style.error} role="alert">
                                    {failure.message}
                                </p>
                            )}
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button
                                id={cancelId}
                                intent="secondary"
                                onClick={onCancel}
                                disabled={isPurchasing}
                            >
                                やめる
                            </Button>
                            <Button
                                intent="primary"
                                onClick={onConfirm}
                                disabled={!canConfirm}
                                aria-busy={isPurchasing || undefined}
                            >
                                {isPurchasing ? "買っています…" : "買う"}
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
