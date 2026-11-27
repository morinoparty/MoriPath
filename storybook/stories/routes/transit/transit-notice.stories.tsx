import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { TransitNotice } from "@/routes/_signed_in/map/transit/-components/transit-notice";
import { withTransitPadding } from "./transit-decorator";

const meta: Meta<typeof TransitNotice> = {
    title: "Transit/TransitNotice",
    component: TransitNotice,
    tags: ["autodocs"],
    decorators: [withTransitPadding],
};

export default meta;

type Story = StoryObj<typeof TransitNotice>;

export const Unavailable: Story = { args: { kind: "unavailable" } };
export const NetworkError: Story = {
    args: { kind: "networkError", onRetry: fn() },
};
export const NoRoute: Story = { args: { kind: "noRoute" } };
export const SameStation: Story = { args: { kind: "sameStation" } };
export const StationNotFound: Story = { args: { kind: "stationNotFound" } };
export const RouteUnavailable: Story = { args: { kind: "routeUnavailable" } };
export const RouteError: Story = {
    args: { kind: "routeError", onRetry: fn() },
};
export const NoMatch: Story = { args: { kind: "noMatch", query: "zzz" } };
