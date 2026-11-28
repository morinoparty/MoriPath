import type { Meta, StoryObj } from "@storybook/react";
import { DifficultyPicker } from "@/routes/_signed_in/quest/-components/difficulty-picker";
import { noop, withQuestFrame } from "./quest-decorator";

const meta: Meta<typeof DifficultyPicker> = {
    title: "Quest/DifficultyPicker",
    component: DifficultyPicker,
    tags: ["autodocs"],
    decorators: [withQuestFrame],
    args: {
        disabledReason: null,
        orderingDifficulty: null,
        onSelect: noop,
    },
};

export default meta;

type Story = StoryObj<typeof DifficultyPicker>;

export const Default: Story = {};

// 「ふつう」を受けている最中
export const Ordering: Story = {
    args: { orderingDifficulty: "normal" },
};

// サーバーにいないときは選べない
export const Offline: Story = {
    args: { disabledReason: "サーバーにいるときだけ受けられます" },
};
