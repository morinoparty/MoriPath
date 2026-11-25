import type { Meta, StoryObj } from "@storybook/react";
import { StationMarker } from "@/routes/_signed_in/map/-components/station-marker";
import { css } from "../../../styled-system/css";

const meta: Meta<typeof StationMarker> = {
    title: "Map/StationMarker",
    component: StationMarker,
    tags: ["autodocs"],
    decorators: [
        // 駅は座標 (この枠の中央) に当たり判定の中心を合わせて置かれる
        (Story) => (
            <div
                className={css({
                    position: "relative",
                    height: "160px",
                    bg: "colorPalette.bg.subtle",
                })}
            >
                <div
                    className={css({
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                    })}
                >
                    <Story />
                </div>
            </div>
        ),
    ],
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
    },
};

export default meta;

type Story = StoryObj<typeof StationMarker>;

// 拡大しているときは札と駅名
export const Full: Story = {
    args: { detail: "full", hitSize: 80 },
};

// 少し縮小すると札だけ
export const Badges: Story = {
    args: { detail: "badges" },
};

// さらに縮小すると点だけ (当たり判定は 44px を保つ)
export const Dot: Story = {
    args: { detail: "dot" },
};
