import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { StationResultRow } from "@/routes/_signed_in/map/transit/-components/station-result-row";
import { sampleIndex, sampleStation } from "./sample-transit";
import { withTransitPadding } from "./transit-decorator";

const benijima = sampleStation("bnii");
// 「紅島（べにじま）」の中の「べに」の位置
const beniStart = benijima.fullName.indexOf("べに");

const meta: Meta<typeof StationResultRow> = {
    title: "Transit/StationResultRow",
    component: StationResultRow,
    tags: ["autodocs"],
    decorators: [withTransitPadding],
    args: {
        station: sampleStation("ummt"),
        lines: sampleIndex.lineById,
        selected: false,
        onClick: fn(),
    },
};

export default meta;

type Story = StoryObj<typeof StationResultRow>;

// 街の駅 (写真つき)
export const Default: Story = {};

// 読みがなで当たった文字を強調する
export const Highlighted: Story = {
    args: {
        station: benijima,
        nameRange: beniStart >= 0 ? [beniStart, beniStart + 2] : null,
    },
};

export const Selected: Story = {
    args: { selected: true },
};

// 現在地からいちばん近い駅
export const Nearest: Story = {
    args: { station: sampleStation("mrmt"), distance: 80, isNearest: true },
};

// もう一方の枠に入っている駅は選べない
export const Disabled: Story = {
    args: { station: sampleStation("mrmt"), disabledLabel: "出発" },
};
