import type { Meta, StoryObj } from "@storybook/react";
import { StampBook } from "@/routes/_signed_in/my-page/-components/stamp-book";
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

// 6 枚を超えた分は「+N」のタイルにまとめる
export const Default: Story = {
    args: { stamps: sampleStamps },
};

// 6 枚以下なら「+N」のタイルは出さない
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
                { shortCode: "!test.jpg", type: "IMAGE" },
                { shortCode: "!moripa_pink.png", type: "IMAGE" },
                { shortCode: ":unknown-emoji:", type: "EMOJI" },
                { shortCode: ":pizza:", type: "EMOJI", emoji: "🍕" },
            ],
            total: 3405,
        },
    },
};

export const Empty: Story = {
    args: { stamps: { owned: [], total: 3405 } },
};
