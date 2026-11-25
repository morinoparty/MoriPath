import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Meta, StoryObj } from "@storybook/react";
import { PlayerPortrait } from "@/routes/_signed_in/my-page/-components/player-portrait";
import { css } from "../../styled-system/css";
import { craftheadAvatarUrl, samplePlayers } from "../sample-players";
import { sampleMinecraftAssetsUrl } from "../sample-shops";

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
        // Storybook では MC_API_URL を使えないため crafthead.net から取得する。
        // ツルハシは STORYBOOK_MC_ASSETS_URL があるときだけ持たせる (無ければ持たずに同じポーズをとる)
        (Story) => (
            <MinecraftProvider
                assets={sampleMinecraftAssetsUrl}
                config={{ avatarUrl: craftheadAvatarUrl }}
            >
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

// 見比べやすいよう、ポーズのストーリー以外は正面に固定する
export const Online: Story = {
    args: {
        player: samplePlayers.nikomaru,
        presence: { online: true, serverName: "資源サーバー" },
        pose: "front",
    },
};

// Figma の /me と同じく、右側面が見える斜めの立ち姿
export const PoseDiagonal: Story = {
    args: { ...Online.args, pose: "diagonal" },
};

// 右腕を前に掲げてツルハシを持つ
export const PosePickaxe: Story = {
    args: { ...Online.args, pose: "pickaxe" },
};

// 左手を振る
export const PoseWave: Story = {
    args: { ...Online.args, pose: "wave" },
};

// 実際のページと同じく、表示のたびにポーズをランダムに選ぶ
export const PoseRandom: Story = {
    args: { ...Online.args, pose: undefined },
};

export const Offline: Story = {
    args: {
        player: samplePlayers.chocolatt,
        presence: { online: false, serverName: null },
        pose: "front",
    },
};

// オンライン状況を取得できなかったときはピルを出さない
export const NoPresence: Story = {
    args: {
        player: samplePlayers.kina1120,
        presence: null,
        pose: "front",
    },
};

// 最も幅を取る 16 文字の ID。40px から縮めて 1 行に収める
export const LongestName: Story = {
    args: {
        player: { id: samplePlayers.nikomaru.id, name: "mmmmmmmmmmmmmmmm" },
        presence: { online: true, serverName: "生活サーバー" },
        pose: "front",
    },
};
