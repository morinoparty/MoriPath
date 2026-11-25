import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Meta, StoryObj } from "@storybook/react";
import { PlayerMarker } from "@/routes/_signed_in/map/-components/player-marker";
import { css } from "../../../styled-system/css";
import { craftheadAvatarUrl, samplePlayers } from "../../sample-players";

const meta: Meta<typeof PlayerMarker> = {
    title: "Map/PlayerMarker",
    component: PlayerMarker,
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

type Story = StoryObj<typeof PlayerMarker>;

// ログイン中のプレイヤーは顔だけ
export const Self: Story = {
    args: {
        playerId: samplePlayers.nikomaru.id,
        playerName: samplePlayers.nikomaru.name,
        isSelf: true,
    },
};

// ほかのプレイヤーは顔と名前のチップ
export const Other: Story = {
    args: {
        playerId: samplePlayers.chocolatt.id,
        playerName: samplePlayers.chocolatt.name,
    },
};

// 地図が追いかけている人は、ブランド色の輪で囲む
export const Followed: Story = {
    args: {
        playerId: samplePlayers.chocolatt.id,
        playerName: samplePlayers.chocolatt.name,
        isFollowed: true,
    },
};
