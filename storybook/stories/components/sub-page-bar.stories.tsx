import type { Meta, StoryObj } from "@storybook/react";
import { SubPageBar } from "@/components/sub-page-bar";
import { css } from "../../styled-system/css";

const meta: Meta<typeof SubPageBar> = {
    title: "Components/SubPageBar",
    component: SubPageBar,
    tags: ["autodocs"],
    decorators: [
        // 下層ページの地と左右の余白に合わせた枠
        (Story) => (
            <div
                className={css({
                    width: "402px",
                    paddingX: "6",
                    paddingY: "4",
                    bg: "colorPalette.bg",
                })}
            >
                <Story />
            </div>
        ),
    ],
    args: {
        title: "どんぐりを送る",
        backTo: "/my-page",
    },
};

export default meta;

type Story = StoryObj<typeof SubPageBar>;

export const Default: Story = {};
