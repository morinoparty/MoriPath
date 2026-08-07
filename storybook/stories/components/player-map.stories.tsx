import {
    MinecraftProvider,
    PlayerMap,
} from "@morinoparty/chlorophyll-react/components";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof PlayerMap> = {
    title: "Components/PlayerMap",
    component: PlayerMap,
    tags: ["autodocs"],
    decorators: [
        // app (components/ui/provider.tsx) と同じく crafthead.net からアバターを取得する
        (Story) => (
            <MinecraftProvider
                config={{
                    avatarUrl: (playerId, pixelSize) =>
                        `https://crafthead.net/avatar/${playerId}/${pixelSize}`,
                }}
            >
                <Story />
            </MinecraftProvider>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof PlayerMap>;

export const Default: Story = {
    args: {
        playerId: "389b1a68-f647-4dd0-a421-61b6c22fdebe",
        playerName: "Chocolatt",
        size: "md",
    },
};

export const Large: Story = {
    args: {
        playerId: "389b1a68-f647-4dd0-a421-61b6c22fdebe",
        playerName: "Chocolatt",
        size: "xl",
    },
};
