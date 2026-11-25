import type { Meta, StoryObj } from "@storybook/react";
import { OnlineStatus } from "@/routes/_signed_in/-components/online-status";
import type { ServerPlayerData } from "@/types/player";
import { samplePlayers } from "../sample-players";

// 主役の _NIKOMARU と、サンプルに使ってよい 4 人だけを並べる
const toServerPlayer = ({ id, name }: { id: string; name: string }) => ({
    id,
    username: name,
});

const mockPlayers: ServerPlayerData[] = [
    samplePlayers.nikomaru,
    samplePlayers.chocolatt,
    samplePlayers.kina1120,
].map(toServerPlayer);

const manyMockPlayers: ServerPlayerData[] = [
    ...mockPlayers,
    toServerPlayer(samplePlayers.tututututu201),
    toServerPlayer(samplePlayers.hikighaL),
];

const meta: Meta<typeof OnlineStatus> = {
    title: "Index/OnlineStatus",
    tags: ["autodocs"],
    parameters: {
        layout: "fullwidth",
    },
};

export default meta;

type Story = StoryObj<typeof OnlineStatus>;

export const Default: Story = {
    render: () => (
        <OnlineStatus.Root players={mockPlayers}>
            <OnlineStatus.Count />
            <OnlineStatus.PlayerList />
        </OnlineStatus.Root>
    ),
};

export const Empty: Story = {
    render: () => (
        <OnlineStatus.Root players={[]}>
            <OnlineStatus.Count />
            <OnlineStatus.PlayerList />
        </OnlineStatus.Root>
    ),
};

export const SinglePlayer: Story = {
    render: () => (
        <OnlineStatus.Root players={[mockPlayers[0]]}>
            <OnlineStatus.Count />
            <OnlineStatus.PlayerList />
        </OnlineStatus.Root>
    ),
};

export const ManyPlayers: Story = {
    render: () => (
        <OnlineStatus.Root players={manyMockPlayers}>
            <OnlineStatus.Count />
            <OnlineStatus.PlayerList />
        </OnlineStatus.Root>
    ),
};
export const CustomLabels: Story = {
    render: () => (
        <OnlineStatus.Root players={mockPlayers}>
            <OnlineStatus.Count label="現在接続中" unit="名" />
            <OnlineStatus.PlayerList />
        </OnlineStatus.Root>
    ),
};

export const SmallPlayerAvatars: Story = {
    render: () => (
        <OnlineStatus.Root players={mockPlayers}>
            <OnlineStatus.Count />
            <OnlineStatus.PlayerList size="md" />
        </OnlineStatus.Root>
    ),
};

export const LargePlayerAvatars: Story = {
    render: () => (
        <OnlineStatus.Root players={mockPlayers}>
            <OnlineStatus.Count />
            <OnlineStatus.PlayerList size="lg" />
        </OnlineStatus.Root>
    ),
};

export const CountOnly: Story = {
    render: () => (
        <OnlineStatus.Root players={mockPlayers}>
            <OnlineStatus.Count />
        </OnlineStatus.Root>
    ),
};
