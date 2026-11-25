import type { Meta, StoryObj } from "@storybook/react";
import { StampBookPageView } from "@/routes/_signed_in/my-page/stamps/-components/stamp-book-page-view";
import { css } from "../../styled-system/css";
import { manySampleStamps, sampleStamps } from "../sample-stamps";

const meta: Meta<typeof StampBookPageView> = {
    title: "MyPage/StampBookPageView",
    component: StampBookPageView,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
    },
    decorators: [
        // アプリの Layout に合わせ、スマートフォンの幅で表示する
        (Story) => (
            <div
                className={css({
                    maxWidth: "md",
                    margin: "0 auto",
                    color: "colorPalette.fg",
                    textStyle: "body",
                })}
            >
                <Story />
            </div>
        ),
    ],
    args: {
        // 再読み込みは loader を取り直すだけなので、ストーリーでは何もしない
        onRetry: () => {},
    },
};

export default meta;

type Story = StoryObj<typeof StampBookPageView>;

// 長い名前は 2 行で切り、画像の無いスタンプや対応表に無い絵文字は仮のタイルにする
export const Default: Story = {
    args: { stamps: manySampleStamps },
};

export const Few: Story = {
    args: {
        stamps: { owned: sampleStamps.owned.slice(0, 3), total: 3405 },
    },
};

export const Empty: Story = {
    args: { stamps: { owned: [], total: 3405 } },
};

// 取得に失敗したときは、空とは分けて再読み込みを促す
export const LoadFailed: Story = {
    args: { stamps: null },
};
