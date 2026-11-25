import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { MapTargetPin } from "@/routes/_signed_in/map/-components/map-target-pin";
import { css } from "../../../styled-system/css";

const meta: Meta<typeof MapTargetPin> = {
    title: "Map/MapTargetPin",
    component: MapTargetPin,
    tags: ["autodocs"],
    args: { x: 120, z: -340, onClear: fn() },
    decorators: [
        // ピンは座標 (十字の交点) に足元を合わせて置かれる
        (Story) => (
            <div
                className={css({
                    position: "relative",
                    height: "240px",
                    bg: "colorPalette.bg.subtle",
                    backgroundImage:
                        "linear-gradient({colors.border.muted}, {colors.border.muted}), linear-gradient({colors.border.muted}, {colors.border.muted})",
                    backgroundSize: "1px 100%, 100% 1px",
                    backgroundPosition: "50% 0, 0 80%",
                    backgroundRepeat: "no-repeat",
                })}
            >
                <div
                    className={css({
                        position: "absolute",
                        left: "50%",
                        top: "80%",
                    })}
                >
                    <Story />
                </div>
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof MapTargetPin>;

// お店の詳細の「マップで見る」から開いたとき
export const Shop: Story = {
    args: { type: "shop", label: "丸石" },
};

// マイページの土地から開いたとき (名前なし)
export const Claim: Story = {
    args: { type: "claim", x: -1024, z: 2048 },
};

export const Station: Story = {
    args: { type: "station", label: "あわもり駅" },
};

export const Point: Story = {
    args: { type: "point" },
};

// 長い名前は 1 行で切る
export const LongLabel: Story = {
    args: {
        type: "shop",
        label: "エンチャントされたダイヤモンドのツルハシ (効率強化 V)",
    },
};

// 閉じるボタンなし
export const WithoutClear: Story = {
    args: { type: "shop", label: "丸石", onClear: undefined },
};
