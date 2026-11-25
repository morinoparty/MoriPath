import type { Meta, StoryObj } from "@storybook/react";
import { CostCard } from "@/routes/_signed_in/balance-claim/-components/cost-card";
import { quoteClaimPurchase } from "@/routes/_signed_in/balance-claim/-functions/block-count";
import { sampleCurrent, withClaimFrame } from "./claim-decorator";

const meta: Meta<typeof CostCard> = {
    title: "BalanceClaim/CostCard",
    component: CostCard,
    tags: ["autodocs"],
    decorators: [withClaimFrame],
    args: {
        ...sampleCurrent,
        quote: quoteClaimPurchase(500, sampleCurrent),
    },
};

export default meta;

type Story = StoryObj<typeof CostCard>;

// Figma の /balance-claim と同じ 500 ブロック
export const Default: Story = {};

// 残高が足りないときは、買ったあとのどんぐりを危険の色にする
export const Insufficient: Story = {
    args: { quote: quoteClaimPurchase(2000, sampleCurrent) },
};

// 単価の設定が無いときは、合計とどんぐりの行を出さない
export const PriceUnknown: Story = {
    args: {
        unitPrice: null,
        quote: quoteClaimPurchase(500, { ...sampleCurrent, unitPrice: null }),
    },
};
