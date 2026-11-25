import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Meta, StoryObj } from "@storybook/react";
import { HomeHeader } from "@/components/home-header";
import { css } from "../../styled-system/css";
import { craftheadAvatarUrl, sampleSession } from "../sample-players";

const meta: Meta = {
    title: "Components/HomeHeader",
    tags: ["autodocs"],
    parameters: {
        layout: "fullwidth",
    },
    decorators: [
        (Story) => (
            <MinecraftProvider config={{ avatarUrl: craftheadAvatarUrl }}>
                <div className={css({ bg: "colorPalette.bg", maxWidth: "md" })}>
                    <Story />
                </div>
            </MinecraftProvider>
        ),
    ],
};

export default meta;

type Story = StoryObj;

export const LoggedIn: Story = {
    render: () => <HomeHeader.Builted session={sampleSession} />,
};

// ログアウト中は顔アイコンを出さない
export const LoggedOut: Story = {
    render: () => <HomeHeader.Builted session={null} />,
};

export const Compound: Story = {
    render: () => (
        <HomeHeader.Root>
            <HomeHeader.ServerSwitcher />
            <HomeHeader.Actions>
                <HomeHeader.NotificationButton />
                <HomeHeader.Avatar session={sampleSession} />
            </HomeHeader.Actions>
        </HomeHeader.Root>
    ),
};

// 左上のパーティ切り替えを開いた状態。つりのパーティはまだ選べない
export const PartySwitcherOpen: Story = {
    render: () => (
        <HomeHeader.Root>
            <HomeHeader.ServerSwitcher defaultOpen />
            <HomeHeader.Actions>
                <HomeHeader.NotificationButton />
                <HomeHeader.Avatar session={sampleSession} />
            </HomeHeader.Actions>
        </HomeHeader.Root>
    ),
};

// 右上の顔アイコンのメニューを開いた状態
export const UserMenuOpen: Story = {
    render: () => (
        <HomeHeader.Root>
            <HomeHeader.ServerSwitcher />
            <HomeHeader.Actions>
                <HomeHeader.NotificationButton />
                <HomeHeader.Avatar session={sampleSession} defaultOpen />
            </HomeHeader.Actions>
        </HomeHeader.Root>
    ),
};
