import type { Meta, StoryObj } from "@storybook/react";
import { PurchaseResult } from "@/routes/_signed_in/balance-claim/-components/purchase-result";
import { withClaimFrame } from "./claim-decorator";

const meta: Meta<typeof PurchaseResult> = {
    title: "BalanceClaim/PurchaseResult",
    component: PurchaseResult,
    tags: ["autodocs"],
    decorators: [withClaimFrame],
    args: {
        result: {
            purchased: 500,
            totalCost: 5000,
            balance: 7480,
            remainingClaimBlocks: 1740,
        },
    },
};

export default meta;

type Story = StoryObj<typeof PurchaseResult>;

export const Default: Story = {};
