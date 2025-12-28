import type { Meta, StoryObj } from "@storybook/react";
import { Navbar } from "./index";

const meta: Meta<typeof Navbar> = {
    title: "Index/Navbar",
    component: Navbar,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
    },
    decorators: [
        (Story) => (
            <div style={{ position: "relative", height: "200px" }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof Navbar>;

export const Default: Story = {};
