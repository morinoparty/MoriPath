import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
    MarkerToggleMenu,
    type MarkerToggleMenuProps,
} from "@/routes/_signed_in/map/-components/marker-toggle-menu";
import { defaultOverlays } from "@/routes/_signed_in/map/-functions/default-overlays";
import { css } from "../../../styled-system/css";

/** 操作した結果を画面に反映できるよう、value をストーリー側の state で持つ */
function Controlled(args: MarkerToggleMenuProps) {
    const [value, setValue] = useState(args.value);
    return (
        <MarkerToggleMenu {...args} value={value} onValueChange={setValue} />
    );
}

const meta: Meta<typeof MarkerToggleMenu> = {
    title: "Map/MarkerToggleMenu",
    component: MarkerToggleMenu,
    tags: ["autodocs"],
    parameters: {
        // ドキュメントでも開いたメニューが切れないよう iframe に分ける
        docs: { story: { inline: false, iframeHeight: 420 } },
    },
    decorators: [
        (Story) => (
            <div
                className={css({
                    minHeight: "400px",
                    p: "4",
                    bg: "colorPalette.bg.subtle",
                })}
            >
                <Story />
            </div>
        ),
    ],
    // チェックの切り替えを画面上で確かめられるよう、状態をストーリー側で持つ
    render: (args) => <Controlled {...args} />,
};

export default meta;

type Story = StoryObj<typeof MarkerToggleMenu>;

export const Closed: Story = {
    args: { value: defaultOverlays },
};

// Figma の /maps/markers と同じ、開いた状態
export const Open: Story = {
    args: { value: defaultOverlays, defaultOpen: true },
};
