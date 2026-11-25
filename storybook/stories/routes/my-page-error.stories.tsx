import type { Meta, StoryObj } from "@storybook/react";
import { MyPageError } from "@/routes/_signed_in/my-page/-components/my-page-error";
import { css } from "../../styled-system/css";

const meta: Meta<typeof MyPageError> = {
    title: "MyPage/MyPageError",
    component: MyPageError,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
    decorators: [
        // アプリの Layout と同じ幅と地の色で表示する
        (Story) => (
            <div
                className={css({
                    maxWidth: "md",
                    margin: "0 auto",
                    bg: "colorPalette.bg",
                    color: "colorPalette.fg",
                    textStyle: "body",
                })}
            >
                <Story />
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof MyPageError>;

// loader が失敗したときに出る表示
export const Default: Story = {
    args: {
        onRetry: () => {},
    },
};
