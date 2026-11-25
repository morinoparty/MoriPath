import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Meta, StoryObj } from "@storybook/react";
import { TabBar } from "@/components/tab-bar";
import { HomeView } from "@/routes/_signed_in/-components/home-view";
import { css } from "../../styled-system/css";
import { sampleDiaryEntries } from "../sample-diary";
import { pending } from "../sample-pending";
import {
    craftheadAvatarUrl,
    sampleOnlinePlayers,
    samplePlayers,
    sampleSession,
} from "../sample-players";

const meta: Meta<typeof HomeView> = {
    title: "Index/HomeView",
    component: HomeView,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
    },
    decorators: [
        (Story) => (
            <MinecraftProvider config={{ avatarUrl: craftheadAvatarUrl }}>
                {/* 実際の画面と同じく、TabBar に隠れない下余白を取ってから TabBar を重ねる */}
                <div
                    className={css({
                        bg: "colorPalette.bg",
                        maxWidth: "md",
                        minHeight: "100vh",
                        margin: "0 auto",
                        paddingBottom: "120px",
                    })}
                >
                    <Story />
                    <TabBar active="home" />
                </div>
            </MinecraftProvider>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof HomeView>;

export const Default: Story = {
    args: {
        session: sampleSession,
        player: samplePlayers.nikomaru,
        balance: 12480,
        claimBlocks: 1240,
        voteStreak: 7,
        diaryEntries: sampleDiaryEntries,
        onlinePlayers: sampleOnlinePlayers,
    },
};

// サーバーに誰もいないとき
export const NobodyOnline: Story = {
    args: {
        session: sampleSession,
        player: samplePlayers.nikomaru,
        balance: 12480,
        claimBlocks: 1240,
        voteStreak: 7,
        diaryEntries: sampleDiaryEntries,
        onlinePlayers: [],
    },
};

// 投票状況などが取れず、ダイアリーもまだ無いとき
export const Unavailable: Story = {
    args: {
        session: sampleSession,
        player: samplePlayers.nikomaru,
        balance: null,
        claimBlocks: null,
        voteStreak: null,
        diaryEntries: null,
        onlinePlayers: null,
    },
};

// 描くたびに作り直すと React が別の Promise として待ち直すため、1 つだけ作って使い回す
const pendingNumber = pending<number | null>();
const pendingDiary = pending<null>();

// 残高・ダイアリー・オンライン一覧が届くまで。見出しとスキンは先に出し、ほかはスケルトンにする。
// Promise は args に入れると Storybook が複製してしまうため、render で直接渡す
export const Loading: Story = {
    args: {
        session: sampleSession,
        player: samplePlayers.nikomaru,
        onlinePlayers: undefined,
    },
    render: (args) => (
        <HomeView
            {...args}
            balance={pendingNumber}
            claimBlocks={pendingNumber}
            voteStreak={pendingNumber}
            diaryEntries={pendingDiary}
        />
    ),
};
