import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Meta, StoryObj } from "@storybook/react";
import { PlayerClusterMarker } from "@/routes/_signed_in/map/-components/player-cluster-marker";
import { css } from "../../../styled-system/css";
import { craftheadAvatarUrl, samplePlayers } from "../../sample-players";

const meta: Meta<typeof PlayerClusterMarker> = {
    title: "Map/PlayerClusterMarker",
    component: PlayerClusterMarker,
    tags: ["autodocs"],
    decorators: [
        // Storybook では MC_API_URL を使えないため crafthead.net から取得する
        (Story) => (
            <MinecraftProvider config={{ avatarUrl: craftheadAvatarUrl }}>
                {/* マーカーは座標 (この枠の中央) に中心を合わせて置かれる */}
                <div
                    className={css({
                        position: "relative",
                        height: "120px",
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
            </MinecraftProvider>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof PlayerClusterMarker>;

// 2 人が重なったとき
export const Two: Story = {
    args: {
        players: [samplePlayers.nikomaru, samplePlayers.chocolatt],
    },
};

// 並びきらない人数は「+N」にまとめる
export const Many: Story = {
    args: {
        players: Object.values(samplePlayers),
    },
};
