import type { Meta, StoryObj } from "@storybook/react";
import { ClaimConfirmDialog } from "@/routes/_signed_in/balance-claim/-components/claim-confirm-dialog";
import { quoteClaimPurchase } from "@/routes/_signed_in/balance-claim/-functions/block-count";
import { noop, sampleCurrent, withClaimFrame } from "./claim-decorator";

const meta: Meta<typeof ClaimConfirmDialog> = {
    title: "BalanceClaim/ClaimConfirmDialog",
    component: ClaimConfirmDialog,
    tags: ["autodocs"],
    parameters: {
        // Portal に出るため、ドキュメントでも iframe に分けて表示する
        docs: { story: { inline: false, iframeHeight: 480 } },
    },
    decorators: [withClaimFrame],
    args: {
        open: true,
        count: 500,
        quote: quoteClaimPurchase(500, sampleCurrent),
        balance: sampleCurrent.balance,
        isPurchasing: false,
        failure: null,
        onConfirm: noop,
        onCancel: noop,
    },
};

export default meta;

type Story = StoryObj<typeof ClaimConfirmDialog>;

// 単価が分かるとき。合計の目安と買ったあとの残高を出す
export const Default: Story = {};

// 単価の設定が無いとき。使うどんぐりは買ったあとに出すことを伝える
export const PriceUnknown: Story = {
    args: {
        quote: quoteClaimPurchase(500, { ...sampleCurrent, unitPrice: null }),
    },
};

export const Purchasing: Story = {
    args: { isPurchasing: true },
};

export const Rejected: Story = {
    args: { failure: { kind: "rejected", message: "購入できませんでした" } },
};

// 買えたか分からないとき。二重に買わないよう買うボタンを止める
export const Unknown: Story = {
    args: {
        failure: {
            kind: "unknown",
            message:
                "買えたかどうか確かめられませんでした。保護ブロックの数を確かめてから、もう一度ためしてください",
        },
    },
};
