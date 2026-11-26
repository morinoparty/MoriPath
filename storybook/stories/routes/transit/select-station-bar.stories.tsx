import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { SelectStationBar } from "@/routes/_signed_in/map/transit/-components/select-station-bar";
import { sampleStation } from "./sample-transit";
import { withTransitPadding } from "./transit-decorator";

const meta: Meta<typeof SelectStationBar> = {
    title: "Transit/SelectStationBar",
    component: SelectStationBar,
    tags: ["autodocs"],
    decorators: [withTransitPadding],
    args: { onConfirm: fn() },
};

export default meta;

type Story = StoryObj<typeof SelectStationBar>;

export const ToFrom: Story = {
    args: { station: sampleStation("mrmt"), slot: "from" },
};

export const ToTo: Story = {
    args: { station: sampleStation("ummt"), slot: "to" },
};
