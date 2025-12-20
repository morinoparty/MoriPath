import type { Meta, StoryObj } from "@storybook/react";
import type { SessionData } from "../../lib/server-functions";
import { UserMenu } from ".";

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

const meta: Meta = {
    title: "Components/UserMenu",
    tags: ["autodocs"],
    parameters: {
        layout: "centered",
    },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => (
        <UserMenu.Root session={mockSession}>
            <UserMenu.Trigger>
                <img
                    src="https://crafthead.net/avatar/389b1a68-f647-4dd0-a421-61b6c22fdebe"
                    width="44"
                    height="44"
                    alt="User avatar"
                    style={{ borderRadius: "8px", cursor: "pointer" }}
                />
            </UserMenu.Trigger>
            <UserMenu.Content>
                <UserMenu.ProfileItem />
                <UserMenu.SettingsItem />
                <UserMenu.Separator />
                <UserMenu.LogoutItem />
            </UserMenu.Content>
        </UserMenu.Root>
    ),
};

export const WithoutSettings: Story = {
    render: () => (
        <UserMenu.Root session={mockSession}>
            <UserMenu.Trigger>
                <img
                    src="https://crafthead.net/avatar/389b1a68-f647-4dd0-a421-61b6c22fdebe"
                    width="44"
                    height="44"
                    alt="User avatar"
                    style={{ borderRadius: "8px", cursor: "pointer" }}
                />
            </UserMenu.Trigger>
            <UserMenu.Content>
                <UserMenu.ProfileItem />
                <UserMenu.Separator />
                <UserMenu.LogoutItem />
            </UserMenu.Content>
        </UserMenu.Root>
    ),
};

export const MinimalMenu: Story = {
    render: () => (
        <UserMenu.Root session={mockSession}>
            <UserMenu.Trigger>
                <img
                    src="https://crafthead.net/avatar/389b1a68-f647-4dd0-a421-61b6c22fdebe"
                    width="44"
                    height="44"
                    alt="User avatar"
                    style={{ borderRadius: "8px", cursor: "pointer" }}
                />
            </UserMenu.Trigger>
            <UserMenu.Content>
                <UserMenu.LogoutItem />
            </UserMenu.Content>
        </UserMenu.Root>
    ),
};

export const AllOptions: Story = {
    render: () => (
        <UserMenu.Root session={mockSession}>
            <UserMenu.Trigger>
                <img
                    src="https://crafthead.net/avatar/389b1a68-f647-4dd0-a421-61b6c22fdebe"
                    width="44"
                    height="44"
                    alt="User avatar"
                    style={{ borderRadius: "8px", cursor: "pointer" }}
                />
            </UserMenu.Trigger>
            <UserMenu.Content>
                <UserMenu.ProfileItem />
                <UserMenu.SettingsItem />
                <UserMenu.Separator />
                <UserMenu.LogoutItem />
            </UserMenu.Content>
        </UserMenu.Root>
    ),
};
