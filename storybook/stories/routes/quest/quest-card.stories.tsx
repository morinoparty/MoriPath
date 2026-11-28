import type { Meta, StoryObj } from "@storybook/react";
import { QuestCard } from "@/routes/_signed_in/quest/-components/quest-card";
import { sampleQuests, withQuestFrame } from "./quest-decorator";

const meta: Meta<typeof QuestCard> = {
    title: "Quest/QuestCard",
    component: QuestCard,
    tags: ["autodocs"],
    decorators: [withQuestFrame],
    args: { quest: sampleQuests.foraging },
};

export default meta;

type Story = StoryObj<typeof QuestCard>;

// 進めている途中
export const Active: Story = {};

// 目標を達成し、受付嬢への報告を待っている
export const Reportable: Story = {
    args: { quest: sampleQuests.mining },
};

// 報酬を受け取り済み (Hard のレア)
export const Completed: Story = {
    args: { quest: sampleQuests.debris },
};

// 必要数が分からないときは進捗率だけを出す
export const WithoutAmount: Story = {
    args: {
        quest: {
            ...sampleQuests.foraging,
            currentAmount: null,
            totalAmount: null,
        },
    },
};
