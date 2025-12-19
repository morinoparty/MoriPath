import type { Meta, StoryObj } from "@storybook/react";
import { PlayerMap } from ".";

const meta: Meta<typeof PlayerMap> = {
    title: "Components/PlayerMap",
    component: PlayerMap,
    tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof PlayerMap>;

export const Default: Story = {
    args: {
        uuid: "389b1a68-f647-4dd0-a421-61b6c22fdebe",
        name: "Chocolatt",
        size: "md",
    },
};

export const Large: Story = {
    args: {
        uuid: "389b1a68-f647-4dd0-a421-61b6c22fdebe",
        name: "Chocolatt",
        size: "xl",
    },
};
