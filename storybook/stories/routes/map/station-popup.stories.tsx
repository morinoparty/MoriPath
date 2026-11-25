import type { Meta, StoryObj } from "@storybook/react";
import { StationPopup } from "@/routes/_signed_in/map/-components/station-popup";
import { css } from "../../../styled-system/css";

const meta: Meta<typeof StationPopup> = {
    title: "Map/StationPopup",
    component: StationPopup,
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

type Story = StoryObj<typeof StationPopup>;

// 乗換駅は路線ごとのナンバリングと、乗り入れている路線を並べる
export const Transfer: Story = {
    args: {
        name: "あわもり",
        numberings: [
            {
                lineName: "ぱかぱか高速ライン(緑草線)",
                code: "PAK08",
                color: "#ff00af",
            },
            { lineName: "FM鉄道", code: "FM01", color: "#693ed3" },
        ],
        lines: [
            { name: "ぱかぱか高速ライン(緑草線)", color: "#ff00af" },
            { name: "FM鉄道", color: "#693ed3" },
        ],
    },
};

// 路線は開いてから読み込む
export const LoadingLines: Story = {
    args: {
        name: "白英門(はくえいもん)",
        numberings: [
            {
                lineName: "ぱかぱか高速ライン(緑草線)",
                code: "PAK09",
                color: "#ff00af",
            },
        ],
        lines: null,
    },
};
