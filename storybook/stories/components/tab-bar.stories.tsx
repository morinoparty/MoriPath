import type { Meta, StoryObj } from "@storybook/react";
import { TabBar } from "@/components/tab-bar";
import { css } from "../../styled-system/css";

const meta: Meta<typeof TabBar> = {
    title: "Components/TabBar",
    component: TabBar,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
    },
    argTypes: {
        active: {
            control: "select",
            options: ["home", "map", "quest", "me"],
        },
    },
    decorators: [
        // 画面下に浮かぶ位置を見せるため、ページの地を敷いた高さのある枠に置く
        (Story) => (
            <div className={css({ height: "240px", bg: "colorPalette.bg" })}>
                <Story />
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof TabBar>;

// ダミールーターは "/" にいるため、URL から判定するとホームが選択される
export const Home: Story = {};

export const Map: Story = {
    args: { active: "map" },
};

export const Quest: Story = {
    args: { active: "quest" },
};

export const Me: Story = {
    args: { active: "me" },
};
