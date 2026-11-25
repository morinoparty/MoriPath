import type { Meta, StoryObj } from "@storybook/react";
import { ClaimPurchaseView } from "@/routes/_signed_in/balance-claim/-components/claim-purchase-view";
import {
    maxAffordableBlocks,
    quoteClaimPurchase,
} from "@/routes/_signed_in/balance-claim/-functions/block-count";
import { noop, sampleCurrent, withClaimFrame } from "./claim-decorator";

const meta: Meta<typeof ClaimPurchaseView> = {
    title: "BalanceClaim/ClaimPurchaseView",
    component: ClaimPurchaseView,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
        docs: { story: { inline: false, iframeHeight: 874 } },
    },
    decorators: [withClaimFrame],
    args: {
        ...sampleCurrent,
        count: 500,
        maxBlocks: maxAffordableBlocks(
            sampleCurrent.balance,
            sampleCurrent.unitPrice,
        ),
        quote: quoteClaimPurchase(500, sampleCurrent),
        canPurchase: true,
        isPurchasing: false,
        isConfirming: false,
        failure: null,
        result: null,
        onCountChange: noop,
        onAdd: noop,
        onFillMax: noop,
        onRequestConfirm: noop,
        onCancelConfirm: noop,
        onConfirmPurchase: noop,
        onPurchaseAgain: noop,
    },
};

export default meta;

type Story = StoryObj<typeof ClaimPurchaseView>;

// 500 ブロックを選んだ状態 (Figma の /balance-claim)
export const Default: Story = {};

// 買うボタンを押して確認ダイアログを開いたところ
export const Confirming: Story = {
    args: { isConfirming: true },
};

// 確認ダイアログで買っているところ。ボタンと数の操作を止める
export const Purchasing: Story = {
    args: { isConfirming: true, isPurchasing: true },
};

// 買えたか分からなかったあと。数を選び直すまで買うボタンを止める
export const UnknownFailure: Story = {
    args: {
        canPurchase: false,
        failure: {
            kind: "unknown",
            message:
                "買えたかどうか確かめられませんでした。保護ブロックの数を確かめてから、もう一度ためしてください",
        },
    },
};

// 残高が足りないとき
export const Insufficient: Story = {
    args: {
        count: 2000,
        quote: quoteClaimPurchase(2000, sampleCurrent),
        canPurchase: false,
    },
};

// 単価の設定が無いとき。合計と「最大」は出さず、足りるかの判断は API に任せる
export const PriceUnknown: Story = {
    args: {
        unitPrice: null,
        maxBlocks: null,
        quote: quoteClaimPurchase(500, { ...sampleCurrent, unitPrice: null }),
    },
};

// 残高と保護ブロックを読み込めなかったとき
export const DataUnavailable: Story = {
    args: {
        balance: null,
        remainingClaimBlocks: null,
        maxBlocks: null,
        quote: quoteClaimPurchase(500, {
            ...sampleCurrent,
            balance: null,
            remainingClaimBlocks: null,
        }),
    },
};

// API に断られたとき。選んだ数はそのまま残す
export const Rejected: Story = {
    args: {
        failure: { kind: "rejected", message: "購入できませんでした" },
    },
};

// 買えたが応答が読めず、使った額と買ったあとの値が分からないとき
export const SuccessUnreadable: Story = {
    args: {
        result: {
            purchased: 500,
            totalCost: null,
            balance: null,
            remainingClaimBlocks: null,
        },
    },
};

// 買い終わった状態 (Figma の /balance-claim (完了))
export const Success: Story = {
    args: {
        result: {
            purchased: 500,
            totalCost: 5000,
            balance: 7480,
            remainingClaimBlocks: 1740,
        },
    },
};
