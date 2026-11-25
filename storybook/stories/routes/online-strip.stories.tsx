import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Meta, StoryObj } from "@storybook/react";
import { OnlineStrip } from "@/routes/_signed_in/-components/online-strip";
import { css } from "../../styled-system/css";
import { craftheadAvatarUrl, samplePlayers } from "../sample-players";

// Storybook で使う 5 人を、ホームと同じ並び (名前の頭文字順) で並べる
const onlinePlayers = [
    samplePlayers.nikomaru,
    samplePlayers.chocolatt,
    samplePlayers.hikighaL,
    samplePlayers.kina1120,
    samplePlayers.tututututu201,
];

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

// 4 人以上いるときは 3 人の顔と「+N」にまとめる
export const Many: Story = {
    args: { players: onlinePlayers },
};

// ちょうど 3 人なら「+N」は出さない
export const Three: Story = {
    args: { players: onlinePlayers.slice(0, 3) },
};

export const One: Story = {
    args: { players: onlinePlayers.slice(0, 1) },
};

// 誰もいないときは押せない控えめな帯になる
export const Empty: Story = {
    args: { players: [] },
};
