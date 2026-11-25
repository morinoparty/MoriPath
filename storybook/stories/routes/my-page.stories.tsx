import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Meta, StoryObj } from "@storybook/react";
import { TabBar } from "@/components/tab-bar";
import { MyPageView } from "@/routes/_signed_in/my-page/-components/my-page-view";
import { css } from "../../styled-system/css";
import { craftheadAvatarUrl, samplePlayers } from "../sample-players";

const meta: Meta<typeof MyPageView> = {
    title: "MyPage/MyPageView",
    component: MyPageView,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
        // コンパクトバーと TabBar は position: fixed なので、ドキュメントでも iframe に分けて表示する
        docs: { story: { inline: false, iframeHeight: 874 } },
    },
    decorators: [
        // Storybook では MC_API_URL を使えないため crafthead.net から取得する
        (Story) => (
            <MinecraftProvider config={{ avatarUrl: craftheadAvatarUrl }}>
                {/* アプリの Layout と _signed_in レイアウトに合わせた枠 */}
                <div
                    className={css({
                        maxWidth: "md",
                        margin: "0 auto",
                        bg: "colorPalette.bg",
                        color: "colorPalette.fg",
                        textStyle: "body",
                        paddingBottom:
                            "calc(120px + env(safe-area-inset-bottom))",
                    })}
                >
                    <Story />
                    <TabBar active="me" />
                </div>
            </MinecraftProvider>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof MyPageView>;

export const Default: Story = {
    args: {
        player: samplePlayers.nikomaru,
        presence: { online: true, serverName: "資源サーバー" },
        stats: { balance: 12480, claimBlocks: 1240, voteStreak: 7 },
    },
};

// 投票状況などを取得できなかった値は表示しない
export const PartialData: Story = {
    args: {
        player: samplePlayers.tututututu201,
        presence: null,
        stats: { balance: 320, claimBlocks: null, voteStreak: null },
    },
};

// 最も幅を取る 16 文字の ID
export const LongestName: Story = {
    args: {
        player: { id: samplePlayers.nikomaru.id, name: "mmmmmmmmmmmmmmmm" },
        presence: { online: true, serverName: "生活サーバー" },
        stats: { balance: 12480, claimBlocks: 1240, voteStreak: 7 },
    },
};
