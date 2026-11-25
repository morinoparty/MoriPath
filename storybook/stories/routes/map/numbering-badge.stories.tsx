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
