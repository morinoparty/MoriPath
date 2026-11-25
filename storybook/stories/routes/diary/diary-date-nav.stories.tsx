import type { Meta, StoryObj } from "@storybook/react";
import { DiaryDateNav } from "@/routes/_signed_in/diary/-components/diary-date-nav";
import { sampleToday, withDiaryFrame } from "./diary-decorator";

const meta: Meta<typeof DiaryDateNav> = {
    title: "Diary/DiaryDateNav",
    component: DiaryDateNav,
    tags: ["autodocs"],
    decorators: [withDiaryFrame],
    args: {
        date: "2026-11-24",
        today: sampleToday,
        lastDate: sampleToday,
        canGoBack: true,
    },
};

export default meta;

type Story = StoryObj<typeof DiaryDateNav>;

export const Default: Story = {};

// 今日を開いているとき。「次の日」は押せない
export const Today: Story = {
    args: { date: sampleToday },
};

// 去年の日。年も出す
export const LastYear: Story = {
    args: { date: "2025-12-31" },
};

// 最初の日記を開いているとき。「前の日」は押せない
export const FirstDiary: Story = {
    args: { canGoBack: false },
};
