import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import {
    RouteResult,
    RouteResultLoading,
} from "@/routes/_signed_in/map/transit/-components/route-result";
import { sampleRoute, sampleRouteWithWalk } from "./sample-transit";
import { withTransitPadding } from "./transit-decorator";

const meta: Meta<typeof RouteResult> = {
    title: "Transit/RouteResult",
    component: RouteResult,
    tags: ["autodocs"],
    decorators: [withTransitPadding],
    args: { onRetry: fn() },
};

export default meta;

type Story = StoryObj<typeof RouteResult>;

// もりもと → 雪華郷 (乗りかえ 2 回)
export const Ok: Story = {
    args: { state: { status: "ok", route: sampleRoute } },
};

export const WithWalk: Story = {
    args: { state: { status: "ok", route: sampleRouteWithWalk } },
};

export const NoRoute: Story = {
    args: { state: { status: "noRoute" } },
};

export const SameStation: Story = {
    args: { state: { status: "sameStation" } },
};

export const StationNotFound: Story = {
    args: { state: { status: "stationNotFound" } },
};

export const Unavailable: Story = {
    args: { state: { status: "unavailable" } },
};

// 再試行できる
export const ErrorState: Story = {
    args: { state: { status: "error" } },
};

// 経路を調べているあいだの場所取り
export const Loading: Story = {
    render: () => <RouteResultLoading />,
};
