import type { Meta, StoryObj } from "@storybook/react";
import type { SessionData } from "../../lib/server-functions";
import { LoginStatus } from ".";

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
    title: "Components/LoginStatus",
    tags: ["autodocs"],
    parameters: {
        layout: "centered",
    },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => (
        <LoginStatus.Root session={mockSession}>
            <LoginStatus.Menu.Root session={mockSession}>
                <LoginStatus.Menu.Trigger>
                    <LoginStatus.Avatar />
                </LoginStatus.Menu.Trigger>
                <LoginStatus.Menu.Content>
                    <LoginStatus.Menu.ProfileItem />
                    <LoginStatus.Menu.SettingsItem />
                    <LoginStatus.Menu.Separator />
                    <LoginStatus.Menu.LogoutItem />
                </LoginStatus.Menu.Content>
            </LoginStatus.Menu.Root>
        </LoginStatus.Root>
    ),
};

export const WithoutSettings: Story = {
    render: () => (
        <LoginStatus.Root session={mockSession}>
            <LoginStatus.Menu.Root session={mockSession}>
                <LoginStatus.Menu.Trigger>
                    <LoginStatus.Avatar />
                </LoginStatus.Menu.Trigger>
                <LoginStatus.Menu.Content>
                    <LoginStatus.Menu.ProfileItem />
                    <LoginStatus.Menu.Separator />
                    <LoginStatus.Menu.LogoutItem />
                </LoginStatus.Menu.Content>
            </LoginStatus.Menu.Root>
        </LoginStatus.Root>
    ),
};

export const MinimalMenu: Story = {
    render: () => (
        <LoginStatus.Root session={mockSession}>
            <LoginStatus.Menu.Root session={mockSession}>
                <LoginStatus.Menu.Trigger>
                    <LoginStatus.Avatar />
                </LoginStatus.Menu.Trigger>
                <LoginStatus.Menu.Content>
                    <LoginStatus.Menu.LogoutItem />
                </LoginStatus.Menu.Content>
            </LoginStatus.Menu.Root>
        </LoginStatus.Root>
    ),
};

export const LoggedOut: Story = {
    render: () => <LoginStatus.Root session={null}>Content</LoginStatus.Root>,
};
