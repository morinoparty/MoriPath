import type { Meta, StoryObj } from "@storybook/react";
import type { ServerPlayerData } from "../../types/player";
import { OnlineStatus } from ".";

const mockPlayers: ServerPlayerData[] = [
    { id: "389b1a68-f647-4dd0-a421-61b6c22fdebe", username: "Chocolatt" },
    { id: "069a79f4-44e9-4726-a5be-fca90e38aaf5", username: "Notch" },
    { id: "853c80ef-3c37-49fd-aa49-938b674adae6", username: "jeb_" },
];

const manyMockPlayers: ServerPlayerData[] = [
    ...mockPlayers,
    { id: "f84c6a79-0a4e-45e0-879b-cd49ebd4c4e2", username: "Steve" },
    { id: "ec561538-f3fd-461d-aff5-086b22154bce", username: "Alex" },
    { id: "61699b2e-d327-4a01-9e1e-0ea8c3f06bc6", username: "Herobrine" },
];

const meta: Meta<typeof OnlineStatus> = {
    title: "Components/OnlineStatus",
    tags: ["autodocs"],
    parameters: {
        layout: "fullwidth",
    },
};

export default meta;

type Story = StoryObj<typeof OnlineStatus>;

// Compound Component stories
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
            <OnlineStatus.PlayerList size="sm" />
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
