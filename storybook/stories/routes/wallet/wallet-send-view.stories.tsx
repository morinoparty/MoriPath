import type { Meta, StoryObj } from "@storybook/react";
import { WalletSendView } from "@/routes/_signed_in/wallet/send/-components/wallet-send-view";
import { samplePlayers } from "../../sample-players";
import {
    noop,
    sampleSuggestions,
    withWalletProviders,
} from "./wallet-decorator";

const meta: Meta<typeof WalletSendView> = {
    title: "Wallet/WalletSendView",
    component: WalletSendView,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
        // 確認ダイアログは Portal に出るため、ドキュメントでも iframe に分けて表示する
        docs: { story: { inline: false, iframeHeight: 874 } },
    },
    decorators: [withWalletProviders],
    args: {
        balance: 12480,
        suggestions: sampleSuggestions,
        recipientName: "",
        recipientState: { status: "empty" },
        amount: 0,
        canSend: false,
        step: "input",
        isSending: false,
        sendFailure: null,
        result: null,
        onRecipientNameChange: noop,
        onPickRecipient: noop,
        onAmountKey: noop,
        onFillAll: noop,
        onRequestConfirm: noop,
        onCancelConfirm: noop,
        onConfirmSend: noop,
        onSendAnother: noop,
    },
};

export default meta;

type Story = StoryObj<typeof WalletSendView>;

// 開いた直後。送り先も金額も未入力なので送るボタンは押せない
export const Empty: Story = {};

// 候補から Chocolatt を選び、500 どんぐりを入力した状態 (Figma の /wallet/send)
export const Valid: Story = {
    args: {
        recipientName: samplePlayers.chocolatt.name,
        recipientState: { status: "found", recipient: samplePlayers.chocolatt },
        amount: 500,
        canSend: true,
    },
};

// 入力した Minecraft ID を確認しているところ
export const Checking: Story = {
    args: {
        recipientName: "kina112",
        recipientState: { status: "checking" },
        amount: 500,
    },
};

// 見つからない Minecraft ID を入力した状態
export const RecipientError: Story = {
    args: {
        recipientName: "kina1121",
        recipientState: {
            status: "error",
            message: "このMinecraft IDのプレイヤーは見つかりません",
        },
        amount: 500,
    },
};

// 残高を読み込めなかったときは送れない
export const BalanceUnavailable: Story = {
    args: {
        ...Valid.args,
        balance: null,
        canSend: false,
    },
};

// 送る前の確認ダイアログ
export const Confirm: Story = {
    args: {
        ...Valid.args,
        step: "confirm",
    },
};

// 確認ダイアログで送っているところ
export const Sending: Story = {
    args: {
        ...Confirm.args,
        isSending: true,
    },
};

// API に断られたとき (送り直せる)
export const SendRejected: Story = {
    args: {
        ...Confirm.args,
        sendFailure: { kind: "rejected", message: "残高が足りません" },
    },
};

// 届いたか分からないとき (二重送金を避けるため送るボタンを止める)
export const SendUnknown: Story = {
    args: {
        ...Confirm.args,
        sendFailure: {
            kind: "unknown",
            message:
                "送れたかどうか確かめられませんでした。残高を確かめてから、もう一度ためしてください",
        },
    },
};

// 送り終わった状態
export const Success: Story = {
    args: {
        ...Valid.args,
        step: "done",
        result: {
            amount: 500,
            balance: 11980,
            recipient: samplePlayers.chocolatt,
        },
    },
};
