import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { fn } from "storybook/test";
import {
    PlayerListSheet,
    type PlayerListSheetProps,
} from "@/routes/_signed_in/map/-components/player-list-sheet";
import type { MapPlayerEntryGroup } from "@/routes/_signed_in/map/-types/map-player-entry";
import { css } from "../../../styled-system/css";
import { craftheadAvatarUrl, samplePlayers } from "../../sample-players";

const { nikomaru, chocolatt, kina1120, tututututu201, hikighaL } =
    samplePlayers;

// 表示中のオーバーワールドに 2 人、ネザーに 1 人、地図で追えない人が 2 人
const sampleGroups: MapPlayerEntryGroup[] = [
    {
        key: "minecraft_overworld",
        label: "オーバーワールド",
        entries: [
            { status: "onMap", ...nikomaru, world: "minecraft_overworld" },
            { status: "onMap", ...tututututu201, world: "minecraft_overworld" },
        ],
    },
    {
        key: "minecraft_the_nether",
        label: "ネザー",
        entries: [
            { status: "onMap", ...hikighaL, world: "minecraft_the_nether" },
        ],
    },
    {
        key: "off-map",
        label: "地図で追えない人",
        entries: [
            {
                status: "offMap",
                ...chocolatt,
                reason: "ロビーサーバーにいます",
            },
            {
                status: "offMap",
                ...kina1120,
                reason: "地図に表示されていません",
            },
        ],
    },
];

/** 開閉と追いかけている人をストーリー側の state で持ち、押した結果を確かめられるようにする */
function Controlled(args: PlayerListSheetProps) {
    const [open, setOpen] = useState(args.open);
    const [followedId, setFollowedId] = useState(args.followedId ?? null);
    return (
        <PlayerListSheet
            {...args}
            open={open}
            onOpenChange={setOpen}
            followedId={followedId}
            onSelectPlayer={(entry) => {
                args.onSelectPlayer(entry);
                setOpen(false);
                setFollowedId((current) =>
                    current === entry.id ? null : entry.id,
                );
            }}
        />
    );
}

const meta: Meta<typeof PlayerListSheet> = {
    title: "Map/PlayerListSheet",
    component: PlayerListSheet,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
        docs: { story: { inline: false, iframeHeight: 640 } },
    },
    args: {
        groups: sampleGroups,
        open: false,
        followedId: null,
        onOpenChange: fn(),
        onSelectPlayer: fn(),
    },
    decorators: [
        // Storybook では MC_API_URL を使えないため crafthead.net から取得する
        (Story) => (
            <MinecraftProvider config={{ avatarUrl: craftheadAvatarUrl }}>
                {/* 地図の右上に置かれたボタンから、下に一覧が開く */}
                <div
                    className={css({
                        minHeight: "100vh",
                        p: "4",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "flex-start",
                        bg: "colorPalette.bg.subtle",
                    })}
                >
                    <Story />
                </div>
            </MinecraftProvider>
        ),
    ],
    render: (args) => <Controlled {...args} />,
};

export default meta;

type Story = StoryObj<typeof PlayerListSheet>;

// ボタンを押すと一覧が開く
export const Closed: Story = {};

// 開いた一覧。地図で追えない人は押せない
export const Open: Story = {
    args: { open: true },
};

// tututututu201 を追いかけている
export const Following: Story = {
    args: { open: true, followedId: tututututu201.id },
};

// 一覧を取っているあいだ
export const Loading: Story = {
    args: { open: true, groups: [], isLoading: true },
};

// 誰もいない
export const Empty: Story = {
    args: { open: true, groups: [] },
};
