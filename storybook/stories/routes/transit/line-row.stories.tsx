import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { LineRow } from "@/routes/_signed_in/map/transit/-components/line-row";
import { summarizeLines } from "@/routes/_signed_in/map/transit/-functions/line-summaries";
import { sampleIndex, sampleStation } from "./sample-transit";
import { withTransitPadding } from "./transit-decorator";

// もりもとを出発にしたときの路線一覧 (もりもとを通る路線が先)
const summaries = summarizeLines(sampleIndex, sampleStation("mrmt").id);
const passing = summaries.find((s) => s.passesFrom) ?? summaries[0];
const notPassing = summaries.find((s) => !s.passesFrom) ?? summaries[0];
// 通る街がいちばん多い路線 (写真が「+N」にまとまる)
const manyTowns = [...summaries].sort(
    (a, b) => b.line.towns.length - a.line.towns.length,
)[0];

const meta: Meta<typeof LineRow> = {
    title: "Transit/LineRow",
    component: LineRow,
    tags: ["autodocs"],
    decorators: [withTransitPadding],
    args: { onClick: fn() },
};

export default meta;

type Story = StoryObj<typeof LineRow>;

export const Default: Story = {
    args: { summary: notPassing },
};

// 出発駅を通る路線には「出発駅」の札が付く
export const PassesFrom: Story = {
    args: { summary: passing },
};

// 通る街が多い路線
export const ManyTowns: Story = {
    args: { summary: manyTowns },
};
