import type { Meta, StoryObj } from "@storybook/react";
import { DiaryDayTimeline } from "@/routes/_signed_in/diary/-components/diary-day-timeline";
import {
    sampleFinalizedResult,
    sampleTodayResult,
    withDiaryFrame,
} from "./diary-decorator";

const meta: Meta<typeof DiaryDayTimeline> = {
    title: "Diary/DiaryDayTimeline",
    component: DiaryDayTimeline,
    tags: ["autodocs"],
    decorators: [withDiaryFrame],
    args: {
        result: sampleFinalizedResult,
    },
};

export default meta;

type Story = StoryObj<typeof DiaryDayTimeline>;

// 締まった日。まとめと、朝・昼・夕方・夜に分けたタイムライン
export const Default: Story = {};

// まだ締まっていない日
export const InProgress: Story = {
    args: { result: sampleTodayResult },
};

// 出来事がまだ無い日
export const NoEntries: Story = {
    args: {
        result: {
            kind: "found",
            day: { date: "2026-11-25", summary: null, entries: [] },
        },
    },
};

export const Empty: Story = {
    args: { result: { kind: "empty" } },
};

export const Unavailable: Story = {
    args: { result: { kind: "unavailable" } },
};
