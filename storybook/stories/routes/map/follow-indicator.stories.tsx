import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { FollowIndicator } from "@/routes/_signed_in/map/-components/follow-indicator";
import { css } from "../../../styled-system/css";
import { craftheadAvatarUrl, samplePlayers } from "../../sample-players";

const meta: Meta<typeof FollowIndicator> = {
    title: "Map/FollowIndicator",
    component: FollowIndicator,
    tags: ["autodocs"],
    args: {
        playerId: samplePlayers.chocolatt.id,
        playerName: samplePlayers.chocolatt.name,
        onDismiss: fn(),
    },
    decorators: [
        // Storybook では MC_API_URL を使えないため crafthead.net から取得する
        (Story) => (
            <MinecraftProvider config={{ avatarUrl: craftheadAvatarUrl }}>
                {/* 地図の上、中央に浮かぶ札 */}
                <div
                    className={css({
                        display: "flex",
                        justifyContent: "center",
                        p: "6",
                        bg: "colorPalette.bg.subtle",
                    })}
                >
                    <Story />
                </div>
            </MinecraftProvider>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof FollowIndicator>;

// 地図で追いかけている
export const Following: Story = {};

// ログアウトした・地図から隠れたなどで見当たらない
export const Missing: Story = {
    args: { isMissing: true },
};

// 長い名前は 1 行で切る
export const LongName: Story = {
    args: {
        playerId: samplePlayers.tututututu201.id,
        playerName: samplePlayers.tututututu201.name,
    },
};
