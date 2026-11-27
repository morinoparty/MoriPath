import type { Meta, StoryObj } from "@storybook/react";
import { NumberingBadge } from "@/routes/_signed_in/map/-components/numbering-badge";
import { css } from "../../../styled-system/css";

const meta: Meta<typeof NumberingBadge> = {
    title: "Map/NumberingBadge",
    component: NumberingBadge,
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <div className={css({ p: "6", bg: "colorPalette.bg.subtle" })}>
                <Story />
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof NumberingBadge>;

// 路線の色の枠に記号と番号を縦に並べる
export const Default: Story = {
    args: { code: "PAK08", color: "#ff00af" },
};

// 地図の上に並べる小さい札
export const Small: Story = {
    args: { code: "FM06", color: "#693ed3", size: "sm" },
};

// 路線の色が分からない (API を使えない) ときはブランド色
export const UnknownColor: Story = {
    args: { code: "HAN01", color: null },
};

// 一覧の中で文字と並べる横長の札。路線の色で塗り、明るい色 (#FFF000 など) では黒い文字、暗い色では白い文字にする
export const Inline: Story = {
    render: () => (
        <div
            className={css({ display: "flex", gap: "2", alignItems: "center" })}
        >
            <NumberingBadge code="PAK07" color="#ff00af" layout="inline" />
            <NumberingBadge code="PAK" color="#ff00af" layout="inline" />
            <NumberingBadge
                code="UM02"
                color="#2b7bd9"
                layout="inline"
                size="sm"
            />
            <NumberingBadge code="MU03" color="#FFF000" layout="inline" />
            <NumberingBadge
                code="MU03"
                color="#FFF000"
                layout="inline"
                size="sm"
            />
            <NumberingBadge code="SK01" color="#16FCC0" layout="inline" />
            <NumberingBadge code="HAN01" color={null} layout="inline" />
        </div>
    ),
};
