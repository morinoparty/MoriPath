import type { Meta, StoryObj } from "@storybook/react";
import { LoginButton } from ".";

const meta: Meta<typeof LoginButton> = {
    title: "Auth/LoginButton",
    component: LoginButton,
    tags: ["autodocs"],
    args: {
        onClick: () => {},
    },
};

export default meta;

type Story = StoryObj<typeof LoginButton>;

export const Default: Story = {
    args: {
        onClick: () => {},
    },
};
