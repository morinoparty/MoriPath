import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { TransitView } from "@/routes/_signed_in/map/transit/-components/transit-view";
import {
    sampleNetwork,
    sampleRecentSlugs,
    sampleRoute,
    sampleRouteWithWalk,
    sampleSelfPosition,
} from "./sample-transit";
import { transitPageParameters, withTransitFrame } from "./transit-decorator";

const meta: Meta<typeof TransitView> = {
    title: "Transit/TransitView",
    component: TransitView,
    tags: ["autodocs"],
    parameters: transitPageParameters,
    decorators: [withTransitFrame],
    args: {
        network: sampleNetwork,
        route: null,
        search: {},
        recentSlugs: [],
        selfPosition: null,
        onEditSlot: fn(),
        onSwap: fn(),
        onModeChange: fn(),
        onLineChange: fn(),
        onQueryChange: fn(),
        onConfirmStation: fn(),
        onRetryRoute: fn(),
    },
};

export default meta;

type Story = StoryObj<typeof TransitView>;

// 開いた直後。出発を選んでいる
export const PickFrom: Story = {};

// 出発 (もりもと) が決まり、到着を選んでいる。もりもとを通る路線が上で、いちばん上は写真つき (Figma 路線-1)
export const LineListFromSet: Story = {
    args: { search: { from: "mrmt" } },
};

// ぱかぱか高速ラインの路線図から到着を選ぶ (Figma 路線-2)。駅をタップすると下にボタンが出る
export const LinePicker: Story = {
    args: { search: { from: "mrmt", line: "pakapaka" } },
};

// 駅名でさがす (入力前)。最近の駅と現在地から近い駅 (Figma 検索-1)
export const SearchIdle: Story = {
    args: {
        search: { from: "mrmt", mode: "search" },
        recentSlugs: sampleRecentSlugs,
        selfPosition: sampleSelfPosition,
    },
};

// 「うみ」で検索中。写真は細くなる (Figma 検索-2)
export const SearchTyping: Story = {
    args: { search: { from: "mrmt", mode: "search", q: "うみ" } },
};

// ナンバリングでも探せる
export const SearchByNumbering: Story = {
    args: { search: { from: "mrmt", mode: "search", q: "PAK03" } },
};

// 当たる駅が無い
export const SearchNoMatch: Story = {
    args: { search: { from: "mrmt", mode: "search", q: "zzz" } },
};

// 出発と到着が決まり、経路を出している
export const RouteResult: Story = {
    args: {
        search: { from: "mrmt", to: "sekk" },
        route: { status: "ok", route: sampleRoute },
    },
};

// 経路を調べているあいだ。loader は経路を待たずに Promise で渡すので、枠はすぐに切り替わり経路の欄だけ場所取りを出す
// (Promise は描画のたびに作り直さないよう、ここで 1 回だけ作る)
export const RouteLoading: Story = {
    args: {
        search: { from: "mrmt", to: "sekk" },
        route: new Promise(() => {}),
    },
};

// 経路が届いたあと (loader と同じく Promise で渡す)
export const RouteDeferred: Story = {
    args: {
        search: { from: "mrmt", to: "sekk" },
        route: Promise.resolve({ status: "ok", route: sampleRoute }),
    },
};

// 途中に徒歩の区間がある経路
export const RouteWithWalk: Story = {
    args: {
        search: { from: "mrmt", to: "sekk" },
        route: { status: "ok", route: sampleRouteWithWalk },
    },
};

// 2 駅をむすぶ路線が無い
export const NoRoute: Story = {
    args: {
        search: { from: "mrmt", to: "sekk" },
        route: { status: "noRoute" },
    },
};

// 経路をしらべられなかった (再試行できる)
export const RouteError: Story = {
    args: {
        search: { from: "mrmt", to: "sekk" },
        route: { status: "error" },
    },
};

// 鉄道の API を使えない
export const Unavailable: Story = {
    args: { network: null },
};
