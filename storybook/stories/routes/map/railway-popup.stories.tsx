import type { Meta, StoryObj } from "@storybook/react";
import { RailwayPopup } from "@/routes/_signed_in/map/-components/railway-popup";
import { css } from "../../../styled-system/css";

const meta: Meta<typeof RailwayPopup> = {
    title: "Map/RailwayPopup",
    component: RailwayPopup,
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <div className={css({ p: "6", bg: "colorPalette.bg.subtle" })}>
                <Story />
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof RailwayPopup>;

// Figma の /maps と同じ乗換案内
export const Default: Story = {
    args: {
        route: {
            lineName: "ぱかぱか高速ライン(緑草線)",
            fromStation: "あわもり",
            toStation: "白英門(はくえいもん)",
            travelTime: "約 3.4 分",
            direction: "both",
        },
        lineColor: "#e6007e",
    },
};

// 片道の路線は向きを矢印で示す
export const OneWay: Story = {
    args: {
        route: {
            lineName: "FM鉄道",
            fromStation: "新あつもり",
            toStation: "あつもり南",
            travelTime: "約 0.9 分",
            direction: "oneWay",
        },
        lineColor: "#f5a0dc",
    },
};
