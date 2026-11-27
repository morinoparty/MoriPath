import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { StationSearch } from "@/routes/_signed_in/map/transit/-components/station-search";
import { searchStations } from "@/routes/_signed_in/map/transit/-functions/match-stations";
import {
    findNearbyStations,
    townOf,
} from "@/routes/_signed_in/map/transit/-functions/nearby-stations";
import {
    sampleIndex,
    sampleNetwork,
    sampleRecentSlugs,
    sampleSelfPosition,
    sampleStation,
} from "./sample-transit";
import { withTransitPadding } from "./transit-decorator";

const nearby = findNearbyStations(sampleNetwork.stations, sampleSelfPosition);

const meta: Meta<typeof StationSearch> = {
    title: "Transit/StationSearch",
    component: StationSearch,
    tags: ["autodocs"],
    decorators: [withTransitPadding],
    args: {
        query: "",
        matches: [],
        recent: sampleRecentSlugs.map(sampleStation),
        nearby,
        selfTownLabel: nearby[0]
            ? (townOf(nearby[0].station)?.label ?? null)
            : null,
        lines: sampleIndex.lineById,
        activeSlot: "to",
        selectedId: null,
        disabled: { id: sampleStation("mrmt").id, label: "出発" },
        onQueryChange: fn(),
        onSelect: fn(),
    },
};

export default meta;

type Story = StoryObj<typeof StationSearch>;

// 入力前。最近の駅と現在地から近い駅 (Figma 検索-1)
export const Idle: Story = {};

// 地図に出ていない (現在地が分からない) ときは近い駅を出さない
export const IdleWithoutPosition: Story = {
    args: { nearby: null, selfTownLabel: null },
};

// 「うみ」を入力中 (Figma 検索-2)
export const Typing: Story = {
    args: {
        query: "うみ",
        matches: searchStations(sampleNetwork.stations, "うみ"),
        selectedId: sampleStation("ummt").id,
    },
};
