import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { StampBookPageView } from "@/routes/_signed_in/my-page/stamps/-components/stamp-book-page-view";
import { css } from "../../styled-system/css";
import { mockClipboard } from "../mock-clipboard";
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

// 名前は出さずにタイルだけを並べる。画像の無いスタンプや対応表に無い絵文字は仮のタイルにする
export const Default: Story = {
    args: { stamps: manySampleStamps },
};

// 格子のタイルもマイページと同じく、押すと shortCode を写して toast で知らせる
export const CopyShortCode: Story = {
    args: { stamps: manySampleStamps },
    play: async ({ canvasElement }) => {
        const writeText = fn(async (_text: string) => {});
        const restore = mockClipboard({ writeText });
        try {
            const canvas = within(canvasElement);
            const page = within(canvasElement.ownerDocument.body);
            // 同じ絵文字が並んでいても、先頭の 1 枚を押せば足りる
            const [pizza] = canvas.getAllByRole("button", { name: "ピザ" });
            await userEvent.click(pizza);
            await expect(writeText).toHaveBeenCalledWith(":pizza:");
            // 出てくるときは透明から始まるため、表示し終わるまで待つ
            await waitFor(async () =>
                expect(
                    await page.findByText(":pizza: をコピーしました"),
                ).toBeVisible(),
            );
        } finally {
            restore();
        }
    },
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
