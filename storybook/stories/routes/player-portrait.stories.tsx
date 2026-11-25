import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Meta, StoryObj } from "@storybook/react";
import { PlayerPortrait } from "@/routes/_signed_in/my-page/-components/player-portrait";
import { css } from "../../styled-system/css";
import { craftheadAvatarUrl, samplePlayers } from "../sample-players";

const meta: Meta<typeof PlayerPortrait> = {
    title: "MyPage/PlayerPortrait",
    component: PlayerPortrait,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
        // コンパクトバーは position: fixed なので、ドキュメントでも iframe に分けて表示する
        docs: { story: { inline: false, iframeHeight: 720 } },
    },
    decorators: [
        // Storybook では MC_API_URL を使えないため crafthead.net から取得する
        (Story) => (
            <MinecraftProvider config={{ avatarUrl: craftheadAvatarUrl }}>
                {/* スクロールしてバーへ縮む動きを確かめられるよう、下に高さを足す */}
                <div
                    className={css({
                        maxWidth: "md",
                        margin: "0 auto",
                        minHeight: "200vh",
                        bg: "colorPalette.bg",
                        textStyle: "body",
                    })}
                >
                    <Story />
                </div>
            </MinecraftProvider>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof PlayerPortrait>;

export const Online: Story = {
    args: {
        player: samplePlayers.nikomaru,
        presence: { online: true, serverName: "資源サーバー" },
    },
};

export const Offline: Story = {
    args: {
        player: samplePlayers.chocolatt,
        presence: { online: false, serverName: null },
    },
};

// オンライン状況を取得できなかったときはピルを出さない
export const NoPresence: Story = {
    args: {
        player: samplePlayers.kina1120,
        presence: null,
    },
};

// 最も幅を取る 16 文字の ID。40px から縮めて 1 行に収める
export const LongestName: Story = {
    args: {
        player: { id: samplePlayers.nikomaru.id, name: "mmmmmmmmmmmmmmmm" },
        presence: { online: true, serverName: "生活サーバー" },
    },
};
