import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Meta, StoryObj } from "@storybook/react";
import { OnlinePlayers } from "@/routes/_signed_in/-components/online-players";
import { css } from "../../styled-system/css";
import { craftheadAvatarUrl, sampleOnlinePlayers } from "../sample-players";

// ロビー・メイン・資源に散らばった 5 人
const onlinePlayers = sampleOnlinePlayers;

// フレーズは 5 分ごとに替わるため、見た目を固定するために基準時刻をそろえる
const fixedReferenceTime = Date.UTC(2026, 10, 25, 3, 0, 0);

const meta: Meta<typeof OnlinePlayers> = {
    title: "Index/OnlinePlayers",
    component: OnlinePlayers,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
    },
    decorators: [
        (Story) => (
            <MinecraftProvider config={{ avatarUrl: craftheadAvatarUrl }}>
                {/* シートが画面下から開く様子を見るため、ホームと同じ地の色で画面いっぱいに敷く */}
                <div
                    className={css({
                        bg: "colorPalette.bg",
                        maxWidth: "md",
                        minHeight: "100vh",
                        margin: "0 auto",
                        padding: "6",
                    })}
                >
                    <Story />
                </div>
            </MinecraftProvider>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof OnlinePlayers>;

// 帯を押すとシートが開く
export const Closed: Story = {
    args: {
        players: onlinePlayers,
        referenceTime: fixedReferenceTime,
    },
};

// シートを開いた状態。ロビー・メイン・資源の順にサーバーごとに分ける
export const Open: Story = {
    args: {
        players: onlinePlayers,
        defaultOpen: true,
        referenceTime: fixedReferenceTime,
    },
};

// 1 人だけのとき
export const OpenWithOne: Story = {
    args: {
        players: onlinePlayers.slice(0, 1),
        defaultOpen: true,
        referenceTime: fixedReferenceTime,
    },
};

// 名前を知らないサーバーは、既知のサーバーのあとに ID をそのまま見出しにして並べる
export const OpenWithUnknownServer: Story = {
    args: {
        players: onlinePlayers.map((player) =>
            player.name === "kina1120"
                ? { ...player, server: "event" }
                : player,
        ),
        defaultOpen: true,
        referenceTime: fixedReferenceTime,
    },
};

// 誰もいないときはシートを開けない
export const Empty: Story = {
    args: { players: [] },
};
