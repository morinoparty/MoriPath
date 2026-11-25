import type { Meta, StoryObj } from "@storybook/react";
import { ClaimSummary } from "@/routes/_signed_in/balance-claim/-components/claim-summary";
import { withClaimFrame } from "./claim-decorator";

const meta: Meta<typeof ClaimSummary> = {
    title: "BalanceClaim/ClaimSummary",
    component: ClaimSummary,
    tags: ["autodocs"],
    decorators: [withClaimFrame],
    args: {
        remainingClaimBlocks: 1240,
        balance: 12480,
    },
};

export default meta;

type Story = StoryObj<typeof ClaimSummary>;

export const Default: Story = {};

// 残高と保護ブロックを読み込めなかったとき
export const Unavailable: Story = {
    args: { remainingClaimBlocks: null, balance: null },
};
