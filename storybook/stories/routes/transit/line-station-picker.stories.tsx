import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { LineStationPicker } from "@/routes/_signed_in/map/transit/-components/line-station-picker";
import { lineStationRows } from "@/routes/_signed_in/map/transit/-functions/line-summaries";
import { sampleIndex, sampleStation } from "./sample-transit";
import { withTransitPadding } from "./transit-decorator";

const line = sampleIndex.lineBySlug.get("pakapaka");
if (!line) throw new Error("見本に路線 pakapaka がありません");
const rows = lineStationRows(line, sampleIndex);

const meta: Meta<typeof LineStationPicker> = {
    title: "Transit/LineStationPicker",
    component: LineStationPicker,
    tags: ["autodocs"],
    decorators: [withTransitPadding],
    args: { line, rows, onBack: fn(), onSelect: fn() },
};

export default meta;

type Story = StoryObj<typeof LineStationPicker>;

// 出発 (もりもと) は選べず、うみもとを選んだところ (Figma 路線-2)
export const Default: Story = {
    args: {
        selectedId: sampleStation("ummt").id,
        disabled: { id: sampleStation("mrmt").id, label: "出発" },
    },
};

// まだ何も選んでいない
export const NothingSelected: Story = {
    args: { selectedId: null, disabled: null },
};
