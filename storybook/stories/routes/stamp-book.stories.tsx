import type { Meta, StoryObj } from "@storybook/react";
import {
    StampBook,
    StampBookSkeleton,
} from "@/routes/_signed_in/my-page/-components/stamp-book";
import { css } from "../../styled-system/css";
import { sampleStamps } from "../sample-stamps";

const meta: Meta<typeof StampBook> = {
    title: "MyPage/StampBook",
    component: StampBook,
    tags: ["autodocs"],
    decorators: [
        // マイページの本文と同じ幅で、ページの地の上に置いたときの見え方を確かめる
        (Story) => (
            <div
                className={css({
                    width: "354px",
                    padding: "4",
                    bg: "colorPalette.bg",
                })}
            >
                <Story />
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof StampBook>;

// 7 列 × 2 段に収まらない分は、最後の 1 枠の「+N」のタイルにまとめる
export const Default: Story = {
    args: { stamps: sampleStamps },
};

// 2 段に収まるなら「+N」のタイルは出さない
export const Few: Story = {
    args: {
        stamps: { owned: sampleStamps.owned.slice(0, 3), total: 3405 },
    },
};

// 画像スタンプは /stamp/ 配下の画像を出し、無ければ仮のタイルにする
// 対応表に無い絵文字も仮のタイルになる
export const Placeholders: Story = {
    args: {
        stamps: {
            owned: [
                {
                    shortCode: "!moripa_pink.png",
                    type: "IMAGE",
                    label: "moripa_pink",
                },
                { shortCode: "!test.jpg", type: "IMAGE", label: "test" },
                {
                    shortCode: ":pizza:",
                    type: "EMOJI",
                    emoji: "🍕",
                    label: "ピザ",
                },
                {
                    shortCode: ":unknown-emoji:",
                    type: "EMOJI",
                    label: "unknown-emoji",
                },
            ],
            total: 3405,
        },
    },
};

export const Empty: Story = {
    args: { stamps: { owned: [], total: 3405 } },
};

// スタンプが届くまで。見出しは先に出し、枚数と 7 列 × 2 段のタイルの場所を取る
export const Loading: Story = {
    args: { stamps: { owned: [], total: 0 } },
    render: () => <StampBookSkeleton />,
};
