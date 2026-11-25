import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Meta, StoryObj } from "@storybook/react";
import { SkinCard } from "@/routes/_signed_in/-components/skin-card";
import { css } from "../../styled-system/css";
import { craftheadAvatarUrl, samplePlayers } from "../sample-players";

const meta: Meta<typeof SkinCard> = {
    title: "Index/SkinCard",
    component: SkinCard,
    tags: ["autodocs"],
    parameters: {
        layout: "fullwidth",
    },
    decorators: [
        (Story) => (
            <MinecraftProvider config={{ avatarUrl: craftheadAvatarUrl }}>
                {/* ホームのヒーローと同じく、ページの地の上にカード幅で置く */}
                <div
                    className={css({
                        bg: "colorPalette.bg",
                        padding: "6",
                        width: "240px",
                    })}
                >
                    <Story />
                </div>
            </MinecraftProvider>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof SkinCard>;

export const Default: Story = {
    args: {
        playerId: samplePlayers.nikomaru.id,
        playerName: samplePlayers.nikomaru.name,
    },
};

// UUID が取れなかったときは顔のフォールバックだけを出す
export const WithoutPlayerId: Story = {
    args: {
        playerId: null,
        playerName: samplePlayers.nikomaru.name,
    },
};
