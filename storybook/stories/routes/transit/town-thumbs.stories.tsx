import type { Meta, StoryObj } from "@storybook/react";
import { TownThumbs } from "@/routes/_signed_in/map/transit/-components/town-thumbs";
import { towns } from "@/routes/_signed_in/map/transit/-functions/town-stations";
import { withTransitPadding } from "./transit-decorator";

const meta: Meta<typeof TownThumbs> = {
    title: "Transit/TownThumbs",
    component: TownThumbs,
    tags: ["autodocs"],
    decorators: [withTransitPadding],
};

export default meta;

type Story = StoryObj<typeof TownThumbs>;

export const One: Story = {
    args: { towns: [towns.morimoto] },
};

export const Three: Story = {
    args: { towns: [towns.atsumori, towns.morimoto, towns.umimoto] },
};

// 出しきれない分は「+N」にまとめる
export const Overflow: Story = {
    args: {
        towns: [
            towns.atsumori,
            towns.morimoto,
            towns.umimoto,
            towns.kamimori,
            towns.sekkakyo,
        ],
    },
};
