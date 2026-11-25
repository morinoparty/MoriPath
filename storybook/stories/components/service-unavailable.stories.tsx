import type { Meta, StoryObj } from "@storybook/react";
import { ServiceUnavailable } from "@/components/service-unavailable";
import { css } from "../../styled-system/css";

const meta: Meta<typeof ServiceUnavailable> = {
    title: "Components/ServiceUnavailable",
    component: ServiceUnavailable,
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

type Story = StoryObj<typeof ServiceUnavailable>;

// MineAuth につながらず、セッションを確かめられないときの案内
export const Default: Story = {
    args: {
        onRetry: () => {},
    },
};
