import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Meta, StoryObj } from "@storybook/react";
import { TabBar } from "@/components/tab-bar";
import { HomeView } from "@/routes/_signed_in/-components/home-view";
import { buildPlaceholderDiary } from "@/routes/_signed_in/-functions/build-placeholder-diary";
import { css } from "../../styled-system/css";
import {
    craftheadAvatarUrl,
    samplePlayers,
    sampleSession,
} from "../sample-players";

// 表示が日によって変わらないよう日付を固定する
const sampleEntries = buildPlaceholderDiary(
    new Date("2026-11-25T12:00:00+09:00"),
);

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
        diaryEntries: sampleEntries,
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
        diaryEntries: [],
    },
};
