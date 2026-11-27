import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { FeaturedLineCard } from "@/routes/_signed_in/map/transit/-components/featured-line-card";
import { summarizeLines } from "@/routes/_signed_in/map/transit/-functions/line-summaries";
import { towns } from "@/routes/_signed_in/map/transit/-functions/town-stations";
import { sampleIndex, sampleStation } from "./sample-transit";
import { withTransitPadding } from "./transit-decorator";

const summary = summarizeLines(sampleIndex, sampleStation("mrmt").id)[0];

const meta: Meta<typeof FeaturedLineCard> = {
    title: "Transit/FeaturedLineCard",
    component: FeaturedLineCard,
    tags: ["autodocs"],
    decorators: [withTransitPadding],
    args: { summary, onClick: fn() },
};

export default meta;

type Story = StoryObj<typeof FeaturedLineCard>;

// 両端の街の写真を左右に並べる (Figma 路線-1 のいちばん上)
export const Default: Story = {
    args: { towns: [towns.atsumori, towns.sekkakyo] },
};

// 片方の端だけが街の駅なら、写真を 1 枚だけ横いっぱいに
export const OneTownEnd: Story = {
    args: { towns: [towns.umimoto] },
};
