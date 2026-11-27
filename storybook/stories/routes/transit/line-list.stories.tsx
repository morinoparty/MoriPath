import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { LineList } from "@/routes/_signed_in/map/transit/-components/line-list";
import {
    lineTerminalTowns,
    summarizeLines,
} from "@/routes/_signed_in/map/transit/-functions/line-summaries";
import { towns } from "@/routes/_signed_in/map/transit/-functions/town-stations";
import { sampleIndex, sampleStation } from "./sample-transit";
import { withTransitPadding } from "./transit-decorator";

const morimoto = sampleStation("mrmt");
const withFrom = summarizeLines(sampleIndex, morimoto.id);
// 端の駅が街の駅になっている、もりもとを通る路線を特集の例にする (画面では一覧のいちばん上の路線だけが特集になる)
const featuredSummary = withFrom.find(
    (summary) =>
        summary.passesFrom &&
        lineTerminalTowns(summary.line, sampleIndex).some(
            (slug) => slug !== null,
        ),
);
const featuredTowns = featuredSummary
    ? lineTerminalTowns(featuredSummary.line, sampleIndex).flatMap((slug) =>
          slug ? [towns[slug]] : [],
      )
    : [];
// 特集の路線をいちばん上に並べ直す
const withFeaturedFirst = featuredSummary
    ? [featuredSummary, ...withFrom.filter((s) => s !== featuredSummary)]
    : withFrom;

const meta: Meta<typeof LineList> = {
    title: "Transit/LineList",
    component: LineList,
    tags: ["autodocs"],
    decorators: [withTransitPadding],
    args: { onOpenLine: fn() },
};

export default meta;

type Story = StoryObj<typeof LineList>;

// 出発がまだ決まっていない (名前順)
export const WithoutFrom: Story = {
    args: {
        summaries: summarizeLines(sampleIndex, null),
        fromStation: null,
        featured: null,
    },
};

// 出発 (もりもと) を通る路線が上。いちばん上の路線の端が街の駅なので写真つき
export const WithFromAndFeatured: Story = {
    args: {
        summaries: withFeaturedFirst,
        fromStation: morimoto,
        featured: featuredSummary
            ? { line: featuredSummary.line, towns: featuredTowns }
            : null,
    },
};

// いちばん上の路線の両端が街の駅でなければ、特集にせずふつうの行で出す
export const WithFromWithoutFeatured: Story = {
    args: {
        summaries: withFrom,
        fromStation: morimoto,
        featured: null,
    },
};
