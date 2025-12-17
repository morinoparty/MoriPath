import type { Meta, StoryObj } from "@storybook/react";
import { Notification } from ".";

const meta: Meta<typeof Notification> = {
    title: "Components/Notification",
    component: Notification,
};

export default meta;

type Story = StoryObj<typeof Notification>;

export const Default: Story = {
    args: {},
};
