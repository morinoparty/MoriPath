import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
    MyPageStats,
    MyPageStatsSkeleton,
} from "@/routes/_signed_in/my-page/-components/my-page-stats";
import { css } from "../../styled-system/css";

const meta: Meta<typeof MyPageStats> = {
    title: "MyPage/MyPageStats",
    component: MyPageStats,
    tags: ["autodocs"],
    decorators: [
        // ページの地の上に置いたときの見え方を確かめる
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

type Story = StoryObj<typeof MyPageStats>;

export const Default: Story = {
    args: {
        stats: { balance: 12480, claimBlocks: 1240, voteStreak: 7 },
    },
};

// 取得できなかった値は外し、残りで幅を分け合う
export const Partial: Story = {
    args: {
        stats: { balance: 12480, claimBlocks: null, voteStreak: null },
    },
};

export const LargeValues: Story = {
    args: {
        stats: { balance: 1234567, claimBlocks: 98765, voteStreak: 365 },
    },
};

// 値を隠した状態。ラベルは残し、数値と単位を伏せ字にする
export const Hidden: Story = {
    args: {
        stats: { balance: 12480, claimBlocks: 1240, voteStreak: 7 },
        hidden: true,
    },
};

// タップで表示と非表示を切り替える。アプリでは切り替えた結果を cookie に残す
export const Toggleable: Story = {
    args: {
        stats: { balance: 12480, claimBlocks: 1240, voteStreak: 7 },
    },
    render: function Render(args) {
        const [hidden, setHidden] = useState(false);
        return (
            <MyPageStats {...args} hidden={hidden} onHiddenChange={setHidden} />
        );
    },
};

// 数値が届くまで。ラベルは先に出し、数字の場所だけスケルトンにする
export const Loading: Story = {
    args: { stats: { balance: null, claimBlocks: null, voteStreak: null } },
    render: () => <MyPageStatsSkeleton />,
};
