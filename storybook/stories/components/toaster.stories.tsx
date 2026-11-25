import { Button } from "@morinoparty/chlorophyll-react/components";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { AppToaster, showToast } from "@/components/toaster";
import { css } from "../../styled-system/css";

/** 押すと知らせを出すボタンを並べる。AppToaster は preview の decorator で 1 つだけ置いている */
const ToasterDemo = () => (
    <div className={css({ display: "flex", gap: "3", padding: "6" })}>
        <Button
            intent="secondary"
            onClick={() =>
                showToast({
                    type: "success",
                    title: ":pizza: をコピーしました",
                    meta: { icon: "🍕" },
                })
            }
        >
            成功
        </Button>
        <Button
            intent="secondary"
            onClick={() =>
                showToast({ type: "error", title: "コピーできませんでした" })
            }
        >
            失敗
        </Button>
    </div>
);

const meta: Meta<typeof AppToaster> = {
    title: "Components/Toaster",
    component: AppToaster,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
    },
    render: () => <ToasterDemo />,
};

export default meta;

type Story = StoryObj<typeof AppToaster>;

// TabBar の上に白いピルで 1 件だけ出し、2 秒で消える。続けて出すと前の知らせと入れ替える
export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const page = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole("button", { name: "成功" }));
        await userEvent.click(canvas.getByRole("button", { name: "失敗" }));
        // 出てくるときは透明から始まるため、表示し終わるまで待つ
        await waitFor(async () =>
            expect(
                await page.findByText("コピーできませんでした"),
            ).toBeVisible(),
        );
        // 前の知らせは残さない
        await expect(
            page.queryByText(":pizza: をコピーしました"),
        ).not.toBeInTheDocument();
    },
};
