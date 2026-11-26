import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { ModeTabs } from "@/routes/_signed_in/map/transit/-components/mode-tabs";
import { withTransitPadding } from "./transit-decorator";

const meta: Meta<typeof ModeTabs> = {
    title: "Transit/ModeTabs",
    component: ModeTabs,
    tags: ["autodocs"],
    decorators: [withTransitPadding],
    args: { onValueChange: fn() },
};

export default meta;

type Story = StoryObj<typeof ModeTabs>;

export const Line: Story = {
    args: { value: "line" },
};

export const Search: Story = {
    args: { value: "search" },
};
