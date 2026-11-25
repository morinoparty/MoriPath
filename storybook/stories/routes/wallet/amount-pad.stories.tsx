import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
    AmountPad,
    type AmountPadProps,
} from "@/routes/_signed_in/wallet/send/-components/amount-pad";
import {
    applyAmountKey,
    maxSendableAmount,
} from "@/routes/_signed_in/wallet/send/-functions/amount-input";
import { noop, withWalletProviders } from "./wallet-decorator";

const meta: Meta<typeof AmountPad> = {
    title: "Wallet/AmountPad",
    component: AmountPad,
    tags: ["autodocs"],
    decorators: [withWalletProviders],
    args: {
        amount: 0,
        balance: 12480,
        onKey: noop,
        onFillAll: noop,
    },
};

export default meta;

type Story = StoryObj<typeof AmountPad>;

export const Empty: Story = {};

export const Entered: Story = {
    args: { amount: 500 },
};

export const BalanceUnavailable: Story = {
    args: { balance: null, disabled: true },
};

/** 金額を自前で持ち、キーパッドの操作を反映する */
const InteractiveAmountPad = (args: AmountPadProps) => {
    const [amount, setAmount] = useState(0);
    const max = maxSendableAmount(args.balance);
    return (
        <AmountPad
            {...args}
            amount={amount}
            onKey={(key) =>
                setAmount((current) => applyAmountKey(current, key, max))
            }
            onFillAll={() => setAmount(max)}
        />
    );
};

// キーパッドと物理キーボードで実際に入力できる例 (残高を超えると残高にそろう)
export const Interactive: Story = {
    render: (args) => <InteractiveAmountPad {...args} />,
};
