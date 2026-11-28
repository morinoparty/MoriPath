import type { Meta, StoryObj } from "@storybook/react";
import { TabBar } from "@/components/tab-bar";
import { QuestView } from "@/routes/_signed_in/quest/-components/quest-view";
import { css } from "../../../styled-system/css";
import { sampleSession } from "../../sample-players";
import {
    noop,
    sampleActiveBoard,
    sampleMixedBoard,
    sampleUnorderedBoard,
} from "./quest-decorator";

const meta: Meta<typeof QuestView> = {
    title: "Quest/QuestView",
    component: QuestView,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
        // TabBar とダイアログは position: fixed なので、ドキュメントでも iframe に分けて表示する
        docs: { story: { inline: false, iframeHeight: 874 } },
    },
    decorators: [
        (Story) => (
            // _signed_in レイアウトと同じく、浮いている TabBar の分だけ下を空ける
            <div
                className={css({
                    maxWidth: "md",
                    margin: "0 auto",
                    minHeight: "100vh",
                    paddingBottom: "calc(120px + env(safe-area-inset-bottom))",
                    bg: "colorPalette.bg",
                    color: "colorPalette.fg",
                    textStyle: "body",
                })}
            >
                <Story />
                <TabBar active="quest" />
            </div>
        ),
    ],
    args: {
        session: sampleSession,
        board: sampleActiveBoard,
        orderingDifficulty: null,
        isRerolling: false,
        isConfirmingReroll: false,
        onOrder: noop,
        onRequestReroll: noop,
        onCancelReroll: noop,
        onConfirmReroll: noop,
    },
};

export default meta;

type Story = StoryObj<typeof QuestView>;

// 受けたばかりで、すべて進めている途中
export const Active: Story = {};

// 報告待ち・受け取り済みが混ざった日 (リロールはできない)
export const Mixed: Story = {
    args: { board: sampleMixedBoard },
};

// まだ受けていない日は難易度を選ぶ
export const Unordered: Story = {
    args: { board: sampleUnorderedBoard },
};

// サーバーにいないときは受けられない
export const UnorderedOffline: Story = {
    args: { board: { ...sampleUnorderedBoard, online: false } },
};

// リロールの確認
export const ConfirmingReroll: Story = {
    args: { isConfirmingReroll: true },
};

// 取得できなかったとき
export const Unavailable: Story = {
    args: { board: null },
};
