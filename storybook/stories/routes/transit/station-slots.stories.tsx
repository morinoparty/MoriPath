import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { StationSlots } from "@/routes/_signed_in/map/transit/-components/station-slots";
import { sampleStation } from "./sample-transit";
import { withTransitPadding } from "./transit-decorator";

const meta: Meta<typeof StationSlots> = {
    title: "Transit/StationSlots",
    component: StationSlots,
    tags: ["autodocs"],
    decorators: [withTransitPadding],
    args: { onEditSlot: fn(), onSwap: fn() },
};

export default meta;

type Story = StoryObj<typeof StationSlots>;

// まだどちらも決まっていない。出発を選んでいる
export const Empty: Story = {
    args: { from: null, to: null, activeSlot: "from" },
};

// 出発が決まり、到着を選んでいる
export const FromSetActiveTo: Story = {
    args: { from: sampleStation("mrmt"), to: null, activeSlot: "to" },
};

// 両方決まった (経路を出している)
export const BothSet: Story = {
    args: {
        from: sampleStation("mrmt"),
        to: sampleStation("sekk"),
        activeSlot: null,
    },
};
