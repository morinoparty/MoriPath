import type { Meta, StoryObj } from "@storybook/react";
import { InlineSkeleton, Skeleton } from "@/components/skeleton";
import { OwnerNameSkeleton } from "@/routes/_signed_in/shop/-components/owner-name";
import { css } from "../../styled-system/css";

const meta: Meta<typeof Skeleton> = {
    title: "Components/Skeleton",
    component: Skeleton,
    tags: ["autodocs"],
    decorators: [
        // 一覧の行と同じ淡い面の上に置いて、帯の濃さを確かめる
        (Story) => (
            <div
                className={css({
                    maxWidth: "354px",
                    padding: "4",
                    borderRadius: "panel",
                    bg: "colorPalette.surface.subtle",
                    color: "colorPalette.fg",
                })}
            >
                <Story />
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof Skeleton>;

// 3 つの形 (動きを減らす設定では明滅しない)
export const Variants: Story = {
    render: () => (
        <div
            className={css({ display: "flex", alignItems: "center", gap: "4" })}
        >
            <Skeleton variant="circle" />
            <Skeleton
                variant="rect"
                className={css({
                    width: "48px",
                    height: "48px",
                    borderRadius: "control",
                })}
            />
            <Skeleton variant="text" className={css({ flex: "1" })} />
        </div>
    ),
};

// 文の中に置く帯。周りの文字の高さにそろう
export const Inline: Story = {
    render: () => (
        <p className={css({ fontSize: "15px", lineHeight: "1.4" })}>
            <OwnerNameSkeleton /> のお店 ・ 残り <InlineSkeleton width="3em" />{" "}
            個
        </p>
    ),
};
