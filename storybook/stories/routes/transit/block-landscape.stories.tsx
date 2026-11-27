import type { Meta, StoryObj } from "@storybook/react";
import { BlockLandscape } from "@/routes/_signed_in/map/transit/-components/block-landscape";
import { css } from "../../../styled-system/css";
import { withTransitFrame } from "./transit-decorator";

/** 絵を、見出しの背景と同じく枠いっぱい・下端そろえで見せる (枠の高さを変えると上の空が切り取られる) */
const BlockLandscapePreview = ({ height }: { height: number }) => (
    <div
        className={css({
            position: "relative",
            overflow: "hidden",
            // 見出しの背景と同じ空のグラデーションを下に敷く
            backgroundImage:
                "linear-gradient(180deg, color-mix(in oklab, {colors.umi.4} 75%, {colors.colorPalette.bg}) 0%, color-mix(in oklab, {colors.mori.3} 70%, {colors.colorPalette.bg}) 45%, {colors.colorPalette.bg} 100%)",
        })}
        style={{ height }}
    >
        <BlockLandscape />
    </div>
);

const meta: Meta<typeof BlockLandscapePreview> = {
    title: "Transit/BlockLandscape",
    component: BlockLandscapePreview,
    parameters: { layout: "fullscreen" },
    decorators: [withTransitFrame],
};

export default meta;

type Story = StoryObj<typeof BlockLandscapePreview>;

// Figma (C4) と同じ 470px の高さ。雲・山・木・線路・電車がすべて見える
export const Default: Story = {
    args: { height: 470 },
};

// 背の低い画面の高さ。下端 (地面) を基準にそろえ、上の雲から切り取られる
export const Short: Story = {
    args: { height: 300 },
};
