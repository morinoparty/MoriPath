import type { Meta, StoryObj } from "@storybook/react";
import { DiaryDayView } from "@/routes/_signed_in/diary/-components/diary-day-view";
import {
    sampleFinalizedResult,
    sampleStripDays,
    sampleToday,
    sampleTodayResult,
    withDiaryFrame,
} from "./diary-decorator";

const meta: Meta<typeof DiaryDayView> = {
    title: "Diary/DiaryDayView",
    component: DiaryDayView,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
        docs: { story: { inline: false, iframeHeight: 874 } },
    },
    decorators: [withDiaryFrame],
    args: {
        date: "2026-11-24",
        today: sampleToday,
        lastDate: sampleToday,
        canGoBack: true,
        result: sampleFinalizedResult,
        stripDays: sampleStripDays("2026-11-24"),
    },
};

export default meta;

type Story = StoryObj<typeof DiaryDayView>;

// 締まった日。まとめと、朝から夜までのタイムライン
export const Default: Story = {};

// 今日。まだまとめは無く、「次の日」は押せない
export const Today: Story = {
    args: {
        date: sampleToday,
        result: sampleTodayResult,
        stripDays: sampleStripDays(sampleToday),
    },
};

// 日記の無い日。日付の移動はそのまま使える
export const Empty: Story = {
    args: {
        date: "2026-11-22",
        result: { kind: "empty" },
        stripDays: sampleStripDays("2026-11-22"),
    },
};

// 取得に失敗したとき
export const Unavailable: Story = {
    args: {
        date: "2026-11-23",
        result: { kind: "unavailable" },
        stripDays: sampleStripDays("2026-11-23"),
    },
};

// 2 週間より前に遡ったとき。帯は選んだ日を含む範囲に移る
export const LongAgo: Story = {
    args: {
        date: "2026-10-01",
        result: { kind: "empty" },
        stripDays: sampleStripDays("2026-10-01", []),
    },
};

// 日を移った直後。日付の移動と帯はすぐ出し、タイムラインだけ届くまで場所取りする
export const Loading: Story = {
    args: {
        date: "2026-11-23",
        result: null,
        stripDays: sampleStripDays("2026-11-23"),
    },
};
