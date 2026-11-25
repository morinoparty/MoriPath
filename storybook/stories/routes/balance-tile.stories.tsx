import type { Meta, StoryObj } from "@storybook/react";
import { BalanceTile } from "@/routes/_signed_in/-components/balance-tile";
import { css } from "../../styled-system/css";

const meta: Meta<typeof BalanceTile> = {
    title: "Index/BalanceTile",
    component: BalanceTile,
    tags: ["autodocs"],
    parameters: {
        layout: "fullwidth",
    },
    decorators: [
        (Story) => (
            // ホームの残高の列と同じ幅でページの地に置く
            <div
                className={css({
                    display: "flex",
                    flexDirection: "column",
                    bg: "colorPalette.bg",
                    padding: "6",
                    width: "190px",
                    height: "140px",
                })}
            >
                <Story />
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof BalanceTile>;

export const Acorns: Story = {
    args: { label: "どんぐり", value: 12480 },
};

export const VoteStreak: Story = {
    args: { label: "連続投票", value: 7, unit: "日" },
};

// 取得できなかったときは単位を付けずに「—」を出す
export const Unavailable: Story = {
    args: { label: "連続投票", value: null, unit: "日" },
};

// 残高が届くまで。ラベルは先に出し、数字の場所だけスケルトンにする
export const Loading: Story = {
    args: { label: "どんぐり", value: null, loading: true },
};
