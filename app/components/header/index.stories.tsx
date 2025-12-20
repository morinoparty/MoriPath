import type { Meta, StoryObj } from "@storybook/react";
import type { SessionData } from "../../lib/server-functions";
import { ColorModeButton } from "../ui/color-mode";
import { PaletteButton } from "../ui/palette";
import { LoginStatus } from "../login-status";
import { Notification } from "../notification";
import { Header } from ".";

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
    parameters: {
        layout: "fullwidth",
    },
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

// Compound Component stories
export const CompoundDefault: Story = {
    render: () => (
        <Header.Root>
            <Header.Logo />
            <Header.Actions>
                <ColorModeButton />
                <PaletteButton />
                <Notification />
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
            </Header.Actions>
        </Header.Root>
    ),
};

export const CompoundMinimalActions: Story = {
    render: () => (
        <Header.Root>
            <Header.Logo />
            <Header.Actions>
                <ColorModeButton />
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
            </Header.Actions>
        </Header.Root>
    ),
};

export const CompoundCustomLogo: Story = {
    render: () => (
        <Header.Root>
            <Header.Logo
                to="/"
                src="/moripa.svg"
                alt="Custom MoriPath Logo"
            />
            <Header.Actions>
                <ColorModeButton />
                <PaletteButton />
                <Notification />
            </Header.Actions>
        </Header.Root>
    ),
};
