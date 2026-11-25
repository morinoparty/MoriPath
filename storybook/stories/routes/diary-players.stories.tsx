import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Meta, StoryObj } from "@storybook/react";
import { DiaryPlayers } from "@/routes/_signed_in/-components/diary-players";
import { css } from "../../styled-system/css";
import { craftheadAvatarUrl, samplePlayers } from "../sample-players";

// Storybook で使う 5 人。3 人までは顔だけ、それより多いと「+N」になる
const allPlayers = [
    samplePlayers.nikomaru,
    samplePlayers.chocolatt,
    samplePlayers.kina1120,
    samplePlayers.tututututu201,
    samplePlayers.hikighaL,
];

const meta: Meta<typeof DiaryPlayers> = {
    title: "Index/DiaryPlayers",
    component: DiaryPlayers,
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <MinecraftProvider config={{ avatarUrl: craftheadAvatarUrl }}>
                {/* タイムラインと同じく右端に置き、開いた一覧が下に出る余白を取る */}
                <div
                    className={css({
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "flex-end",
                        bg: "colorPalette.bg",
                        maxWidth: "md",
                        minHeight: "80",
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

type Story = StoryObj<typeof DiaryPlayers>;

// 「+N」を含む顔の列を押すと全員の一覧が開く
export const WithOverflow: Story = {
    args: { players: allPlayers },
};

// 一覧を開いた状態
export const Open: Story = {
    args: { players: allPlayers, defaultOpen: true },
};

// 全員が並ぶときは押せない顔の列だけ
export const AllVisible: Story = {
    args: { players: allPlayers.slice(0, 3) },
};
