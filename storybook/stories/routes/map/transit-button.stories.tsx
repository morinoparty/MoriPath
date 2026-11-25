import type { Meta, StoryObj } from "@storybook/react";
import { TransitButton } from "@/routes/_signed_in/map/-components/transit-button";
import { css } from "../../../styled-system/css";

const meta: Meta<typeof TransitButton> = {
    title: "Map/TransitButton",
    component: TransitButton,
    tags: ["autodocs"],
    decorators: [
        // 地図の右下に浮かぶボタン
        (Story) => (
            <div
                className={css({
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "flex-end",
                    height: "160px",
                    p: "4",
                    bg: "colorPalette.bg.subtle",
                })}
            >
                <Story />
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof TransitButton>;

export const Default: Story = {};
