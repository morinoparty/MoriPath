import type { Meta, StoryObj } from "@storybook/react";
import { OnlineStatus } from ".";
import type { ServerPlayerData } from "../../types/player";

const mockPlayers: ServerPlayerData[] = [
    { id: "389b1a68-f647-4dd0-a421-61b6c22fdebe", username: "Chocolatt" },
    { id: "069a79f4-44e9-4726-a5be-fca90e38aaf5", username: "Notch" },
    { id: "853c80ef-3c37-49fd-aa49-938b674adae6", username: "jeb_" },
];

const meta: Meta<typeof OnlineStatus> = {
    title: "Components/OnlineStatus",
    component: OnlineStatus,
    tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof OnlineStatus>;

export const Default: Story = {
    args: {
        players: mockPlayers,
    },
};

export const Empty: Story = {
    args: {
        players: [],
    },
};

export const SinglePlayer: Story = {
    args: {
        players: [mockPlayers[0]],
    },
};

export const ManyPlayers: Story = {
    args: {
        players: [
            ...mockPlayers,
            { id: "f84c6a79-0a4e-45e0-879b-cd49ebd4c4e2", username: "Steve" },
            { id: "ec561538-f3fd-461d-aff5-086b22154bce", username: "Alex" },
            {
                id: "61699b2e-d327-4a01-9e1e-0ea8c3f06bc6",
                username: "Herobrine",
            },
        ],
    },
};
