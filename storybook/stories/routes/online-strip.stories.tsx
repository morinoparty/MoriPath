import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Meta, StoryObj } from "@storybook/react";
import {
    OnlineStrip,
    OnlineStripSkeleton,
} from "@/routes/_signed_in/-components/online-strip";
import { css } from "../../styled-system/css";
import { craftheadAvatarUrl, sampleOnlinePlayers } from "../sample-players";

// Storybook で使う 5 人を、ホームと同じ並び (名前の頭文字順) で並べる
const onlinePlayers = sampleOnlinePlayers;

const meta: Meta<typeof OnlineStrip> = {
    title: "Index/OnlineStrip",
    component: OnlineStrip,
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <MinecraftProvider config={{ avatarUrl: craftheadAvatarUrl }}>
                {/* ホームの本文と同じ地の色と幅で見る */}
                <div
                    className={css({
                        bg: "colorPalette.bg",
                        maxWidth: "md",
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

type Story = StoryObj<typeof OnlineStrip>;

// 帯に入りきらない人数。右端で顔が消え、横にスクロールして全員を見られる
export const Crowded: Story = {
    args: {
        // 5 人を使い回して 12 人に見せる。key が重ならないよう id に「#番号」を付ける
        players: Array.from({ length: 12 }, (_, index) => {
            const player = onlinePlayers[index % onlinePlayers.length];
            return { ...player, id: `${player.id}#${index}` };
        }),
    },
};

export const Many: Story = {
    args: { players: onlinePlayers },
};

export const One: Story = {
    args: { players: onlinePlayers.slice(0, 1) },
};

// 誰もいないときは押せない控えめな帯になる
export const Empty: Story = {
    args: { players: [] },
};

// オンライン一覧が届くまで。届いたあとの帯と同じ高さで場所を取る
export const Loading: Story = {
    args: { players: [] },
    render: () => <OnlineStripSkeleton />,
};
