import { Button } from "@morinoparty/chlorophyll-react/components";
import { sva } from "../../../../../../../styled-system/css";
import { SubPageBar } from "../../../../../../components/sub-page-bar";
import type {
    AmountKey,
    Recipient,
    RecipientState,
    SendFailure,
    SendResult as SendResultData,
    WalletSendStep,
} from "../../-types/wallet-send";
import { AmountPad } from "../amount-pad";
import { RecipientPicker } from "../recipient-picker";
import { SendConfirmDialog } from "../send-confirm-dialog";
import { SendResult } from "../send-result";

const walletSendStyle = sva({
    slots: ["root", "spacer"],
    base: {
        // 金額・キーパッド・送るボタンを画面の下端に寄せるため、画面の高さいっぱいの縦並びにする
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
    },
});

export interface WalletSendViewProps {
    /** いまの残高。取れなかったときは null (送れない) */
    balance: number | null;
    /** 送り先の候補 (いまオンラインの人。自分は含めない) */
    suggestions: readonly Recipient[];
    recipientName: string;
    recipientState: RecipientState;
    /** 送る金額。0 は未入力 */
    amount: number;
    /** 送り先と金額がそろい、確認へ進めるか */
    canSend: boolean;
    step: WalletSendStep;
    isSending: boolean;
    sendFailure: SendFailure | null;
    /** 送り終わったときの結果。step が done のときだけ入る */
    result: SendResultData | null;
    onRecipientNameChange: (name: string) => void;
    onPickRecipient: (recipient: Recipient) => void;
    onAmountKey: (key: AmountKey) => void;
    onFillAll: () => void;
    onRequestConfirm: () => void;
    onCancelConfirm: () => void;
    onConfirmSend: () => void;
    onSendAnother: () => void;
}

/** どんぐりを送る画面。送り先のカード、金額とキーパッド、送るボタンを縦に並べる */
export const WalletSendView = ({
    balance,
    suggestions,
    recipientName,
    recipientState,
    amount,
    canSend,
    step,
    isSending,
    sendFailure,
    result,
    onRecipientNameChange,
    onPickRecipient,
    onAmountKey,
    onFillAll,
    onRequestConfirm,
    onCancelConfirm,
    onConfirmSend,
    onSendAnother,
}: WalletSendViewProps) => {
    const style = walletSendStyle();
    const recipient =
        recipientState.status === "found" ? recipientState.recipient : null;
    const isConfirming = step === "confirm";

    return (
        <div className={style.root}>
            <SubPageBar title="どんぐりを送る" backTo="/my-page" />
            {step === "done" && result ? (
                <SendResult result={result} onSendAnother={onSendAnother} />
            ) : (
                <>
                    <RecipientPicker
                        suggestions={suggestions}
                        recipientName={recipientName}
                        recipientState={recipientState}
                        onRecipientNameChange={onRecipientNameChange}
                        onPick={onPickRecipient}
                        disabled={isConfirming}
                    />
                    {/* 余白を送り先と金額の間に置き、金額とキーパッドを送るボタンの上 (画面の下側) に寄せる */}
                    <div className={style.spacer} />
                    <AmountPad
                        amount={amount}
                        balance={balance}
                        onKey={onAmountKey}
                        onFillAll={onFillAll}
                        onSubmit={onRequestConfirm}
                        disabled={isConfirming || balance === null}
                    />
                    <Button
                        size="xl"
                        intent="primary"
                        onClick={onRequestConfirm}
                        disabled={!canSend}
                    >
                        {amount > 0
                            ? `${amount.toLocaleString()} どんぐりを送る`
                            : "どんぐりを送る"}
                    </Button>
                    <SendConfirmDialog
                        open={isConfirming}
                        recipient={recipient}
                        amount={amount}
                        balance={balance}
                        isSending={isSending}
                        failure={sendFailure}
                        onConfirm={onConfirmSend}
                        onCancel={onCancelConfirm}
                    />
                </>
            )}
        </div>
    );
};
