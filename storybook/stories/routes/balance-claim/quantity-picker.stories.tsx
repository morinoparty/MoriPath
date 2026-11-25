import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
    QuantityPicker,
    type QuantityPickerProps,
} from "@/routes/_signed_in/balance-claim/-components/quantity-picker";
import { clampBlockCount } from "@/routes/_signed_in/balance-claim/-functions/block-count";
import { noop, withClaimFrame } from "./claim-decorator";

const meta: Meta<typeof QuantityPicker> = {
    title: "BalanceClaim/QuantityPicker",
    component: QuantityPicker,
    tags: ["autodocs"],
    decorators: [withClaimFrame],
    args: {
        count: 500,
        maxBlocks: 1248,
        onCountChange: noop,
        onAdd: noop,
        onFillMax: noop,
    },
};

export default meta;

type Story = StoryObj<typeof QuantityPicker>;

export const Default: Story = {};

// ボタンと入力で実際に数を変えられる見本
const InteractivePicker = (args: QuantityPickerProps) => {
    const [count, setCount] = useState(100);
    const change = (next: number) => setCount(clampBlockCount(next));
    return (
        <QuantityPicker
            {...args}
            count={count}
            onCountChange={change}
            onAdd={(delta) => change(count + delta)}
            onFillMax={() => args.maxBlocks && change(args.maxBlocks)}
        />
    );
};

export const Interactive: Story = {
    render: (args) => <InteractivePicker {...args} />,
};

// 6 けたは文字を小さくして欄に収める
export const LargeCount: Story = {
    args: { count: 999999, maxBlocks: null },
};

// 1 ブロックも買えないときは増やす操作を止める
export const CannotAfford: Story = {
    args: { count: 1, maxBlocks: 0 },
};

// 購入中は操作を止める
export const Disabled: Story = {
    args: { disabled: true },
};
