import {
    Button,
    Dialog,
    PlayerAvatar,
    Portal,
} from "@morinoparty/chlorophyll-react/components";
import { useId } from "react";
import { sva } from "../../../../../../../styled-system/css";
import { formatNumber } from "../../../../../../lib/format-number";
import type { Recipient, SendFailure } from "../../-types/wallet-send";

const sendConfirmStyle = sva({
    slots: [
        "summary",
        "recipient",
        "name",
        "amount",
        "unit",
        "balance",
        "error",
    ],
    base: {
        summary: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2",
            paddingY: "2",
        },
        recipient: {
            display: "flex",
            alignItems: "center",
            gap: "2",
        },
        name: {
            fontFamily: "display",
            fontSize: "18px",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        amount: {
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
        balance: {
            fontSize: "14px",
            fontWeight: "medium",
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

export interface SendConfirmDialogProps {
    open: boolean;
    recipient: Recipient | null;
    amount: number;
    /** 送る前の残高。取れていなければ送金後の残高を出さない */
    balance: number | null;
    /** 送信中は閉じさせず、ボタンも押させない */
    isSending: boolean;
    /** 送れなかったときの内容 */
    failure: SendFailure | null;
    onConfirm: () => void;
    onCancel: () => void;
}

/** 送る前の確認。お金が動くため、送り先・金額・送金後の残高を見せてから送る */
export const SendConfirmDialog = ({
    open,
    recipient,
    amount,
    balance,
    isSending,
    failure,
    onConfirm,
    onCancel,
}: SendConfirmDialogProps) => {
    const style = sendConfirmStyle();
    // 誤って送らないよう、開いたときは「やめる」にフォーカスを置く
    const cancelId = useId();
    // 届いたか分からないときは、二重に送らないよう送るボタンを止める
    const canConfirm = !isSending && failure?.kind !== "unknown";

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
            closeOnEscape={!isSending}
            closeOnInteractOutside={!isSending}
            initialFocusEl={() => document.getElementById(cancelId)}
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>この内容で送りますか？</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            {recipient && (
                                <div className={style.summary}>
                                    <div className={style.recipient}>
                                        <PlayerAvatar
                                            playerId={recipient.id}
                                            playerName={recipient.name}
                                            size="sm"
                                            decorative
                                        />
                                        <span className={style.name}>
                                            {recipient.name}
                                        </span>
                                    </div>
                                    <p className={style.amount}>
                                        {formatNumber(amount)}
                                        <span className={style.unit}>
                                            どんぐり
                                        </span>
                                    </p>
                                    {balance !== null && (
                                        <p className={style.balance}>
                                            残高 {formatNumber(balance)} →{" "}
                                            {formatNumber(balance - amount)}
                                        </p>
                                    )}
                                </div>
                            )}
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
                                disabled={isSending}
                            >
                                やめる
                            </Button>
                            <Button
                                intent="primary"
                                onClick={onConfirm}
                                disabled={!canConfirm}
                                aria-busy={isSending || undefined}
                            >
                                {isSending ? "送っています…" : "送る"}
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
