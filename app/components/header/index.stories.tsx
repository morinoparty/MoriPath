import type { Meta, StoryObj } from "@storybook/react";
import { Header } from ".";
import type { SessionData } from "../../lib/server-functions";

const mockSession: SessionData = {
    user: {
        id: "389b1a68-f647-4dd0-a421-61b6c22fdebe",
        name: "Chocolatt",
        email: "389b1a68-f647-4dd0-a421-61b6c22fdebe@no-reply.morino.party",
        emailVerified: false,
        image: "https://crafthead.net/avatar/389b1a68-f647-4dd0-a421-61b6c22fdebe",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    session: {
        id: "session-id",
        userId: "389b1a68-f647-4dd0-a421-61b6c22fdebe",
        token: "token",
        expiresAt: new Date(),
        ipAddress: "",
        userAgent: "",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
};

const meta: Meta<typeof Header> = {
    title: "Components/Header",
    component: Header,
    tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Header>;

export const LoggedIn: Story = {
    args: {
        session: mockSession,
    },
};

export const LoggedOut: Story = {
    args: {
        session: null,
    },
};
