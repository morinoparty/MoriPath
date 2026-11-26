import type { Meta, StoryObj } from "@storybook/react";
import { RouteSegmentRow } from "@/routes/_signed_in/map/transit/-components/route-segment-row";
import { towns } from "@/routes/_signed_in/map/transit/-functions/town-stations";
import { sampleRoute, sampleRouteWithWalk } from "./sample-transit";
import { withTransitPadding } from "./transit-decorator";

const rail = sampleRoute.segments.find((s) => s.kind === "rail");
const walk = sampleRouteWithWalk.segments.find((s) => s.kind === "walk");
if (!rail || !walk) throw new Error("見本の経路に区間がありません");

const meta: Meta<typeof RouteSegmentRow> = {
    title: "Transit/RouteSegmentRow",
    component: RouteSegmentRow,
    tags: ["autodocs"],
    decorators: [withTransitPadding],
};

export default meta;

type Story = StoryObj<typeof RouteSegmentRow>;

// 電車の区間 (路線一覧の行と同じ見た目)
export const Rail: Story = {
    args: {
        segment: rail,
        towns: rail.kind === "rail" ? rail.towns.map((t) => towns[t]) : [],
    },
};

// 徒歩の区間
export const Walk: Story = {
    args: { segment: walk, towns: [] },
};
