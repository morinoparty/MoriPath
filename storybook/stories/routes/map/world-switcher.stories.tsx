import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
    WorldSwitcher,
    type WorldSwitcherProps,
} from "@/routes/_signed_in/map/-components/world-switcher";
import { css } from "../../../styled-system/css";

/** 操作した結果を画面に反映できるよう、value をストーリー側の state で持つ */
function Controlled(args: WorldSwitcherProps) {
    const [value, setValue] = useState(args.value);
    return <WorldSwitcher {...args} value={value} onValueChange={setValue} />;
}

const meta: Meta<typeof WorldSwitcher> = {
    title: "Map/WorldSwitcher",
    component: WorldSwitcher,
    tags: ["autodocs"],
    parameters: {
        docs: { story: { inline: false, iframeHeight: 260 } },
    },
    decorators: [
        (Story) => (
            <div
                className={css({
                    minHeight: "240px",
                    p: "4",
                    display: "flex",
                    justifyContent: "flex-end",
                    bg: "colorPalette.bg.subtle",
                })}
            >
                <Story />
            </div>
        ),
    ],
    // 選んだワールドにチェックが移ることを確かめられるよう、状態をストーリー側で持つ
    render: (args) => <Controlled {...args} />,
};

export default meta;

type Story = StoryObj<typeof WorldSwitcher>;

export const Default: Story = {
    args: { value: "minecraft_overworld" },
};
