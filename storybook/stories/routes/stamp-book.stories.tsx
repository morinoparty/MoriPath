import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
    StampBook,
    StampBookSkeleton,
} from "@/routes/_signed_in/my-page/-components/stamp-book";
import { css } from "../../styled-system/css";
import { mockClipboard } from "../mock-clipboard";
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

// タイルを押すと shortCode をそのまま写し、写した shortCode を toast で知らせる
export const CopyShortCode: Story = {
    args: { stamps: sampleStamps },
    play: async ({ canvasElement }) => {
        const writeText = fn(async (_text: string) => {});
        const restore = mockClipboard({ writeText });
        try {
            const canvas = within(canvasElement);
            // toast は Portal で body に出るため、body から探す
            const page = within(canvasElement.ownerDocument.body);
            await userEvent.click(
                canvas.getByRole("button", { name: "きらきら" }),
            );
            await expect(writeText).toHaveBeenCalledWith(":sparkles:");
            // 出てくるときは透明から始まるため、表示し終わるまで待つ
            await waitFor(async () =>
                expect(
                    await page.findByText(":sparkles: をコピーしました"),
                ).toBeVisible(),
            );
            // 画像スタンプは「!」と拡張子つきの shortCode を写し、前の toast と入れ替える
            await userEvent.click(
                canvas.getByRole("button", { name: "moripa_pink" }),
            );
            await expect(writeText).toHaveBeenLastCalledWith(
                "!moripa_pink.png",
            );
            // 出てくるときは透明から始まるため、表示し終わるまで待つ
            await waitFor(async () =>
                expect(
                    await page.findByText("!moripa_pink.png をコピーしました"),
                ).toBeVisible(),
            );
        } finally {
            restore();
        }
    },
};

// Clipboard API も execCommand も使えないときは、写せなかったことだけを知らせる
export const CopyFailed: Story = {
    args: { stamps: sampleStamps },
    play: async ({ canvasElement }) => {
        const restore = mockClipboard({
            writeText: fn(async (_text: string) => {
                throw new Error("denied");
            }),
            execCommand: () => false,
        });
        try {
            const canvas = within(canvasElement);
            const page = within(canvasElement.ownerDocument.body);
            await userEvent.click(
                canvas.getByRole("button", { name: "きらきら" }),
            );
            // 出てくるときは透明から始まるため、表示し終わるまで待つ
            await waitFor(async () =>
                expect(
                    await page.findByText("コピーできませんでした"),
                ).toBeVisible(),
            );
        } finally {
            restore();
        }
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
