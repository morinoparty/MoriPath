import type { Meta, StoryObj } from "@storybook/react";
import { Flag } from "lucide-react";
import { MapPin } from "@/routes/_signed_in/map/-components/map-pin";
import { StationLabel } from "@/routes/_signed_in/map/-components/station-label";
import { css } from "../../../styled-system/css";

const meta: Meta<typeof MapPin> = {
    title: "Map/MapPin",
    component: MapPin,
    tags: ["autodocs"],
    decorators: [
        // ピンは座標 (この枠の中央) に先端を合わせて置かれる
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
                        top: "70%",
                    })}
                >
                    <Story />
                </div>
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof MapPin>;

// バナー (町の名前)
export const Banner: Story = {
    args: { label: "あわもり" },
};

export const Spawn: Story = {
    args: { label: "スポーン", icon: Flag },
};

// 駅名は文字だけを駅の中心に置く
export const Station: StoryObj<typeof StationLabel> = {
    render: () => <StationLabel name="白英門(はくえいもん)" />,
};
