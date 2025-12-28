import type { Meta, StoryObj } from "@storybook/react";
import { LandPlot, Nut } from "lucide-react";
import { CardSquare } from ".";

const meta: Meta<typeof CardSquare> = {
    title: "Index/CardSquare",
    component: CardSquare,
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <div style={{ width: "160px", height: "160px" }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof CardSquare>;

export const Default: Story = {
    args: {
        icon: <Nut />,
        label: "どんぐり",
        value: "23,000",
    },
};

export const Claim: Story = {
    args: {
        icon: <LandPlot />,
        label: "保護ブロック",
        value: "124",
    },
};
