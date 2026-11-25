import type { Meta, StoryObj } from "@storybook/react";
import { DiaryDayStrip } from "@/routes/_signed_in/diary/-components/diary-day-strip";
import {
    sampleStripDays,
    sampleToday,
    withDiaryFrame,
} from "./diary-decorator";

const meta: Meta<typeof DiaryDayStrip> = {
    title: "Diary/DiaryDayStrip",
    component: DiaryDayStrip,
    tags: ["autodocs"],
    decorators: [withDiaryFrame],
    args: {
        selected: sampleToday,
        days: sampleStripDays(sampleToday),
    },
};

export default meta;

type Story = StoryObj<typeof DiaryDayStrip>;

// 今日を開いているとき。日記の無い日は薄くなる
export const Default: Story = {};

// 少し前の日を開いているとき
export const PastDay: Story = {
    args: {
        selected: "2026-11-17",
        days: sampleStripDays("2026-11-17"),
    },
};

// 日記のある日が分からないとき (一覧を取れなかった)。全部の日を押せるようにする
export const WithoutExistence: Story = {
    args: {
        days: sampleStripDays(sampleToday, null),
    },
};
