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

// 実際の squaremap の URL はソースに書かないので、見本では届かない URL を使う (タイルは出ず、駅の札と空のグラデーションだけが見える)
const SAMPLE_WORLD_MAP_URL = "https://squaremap.example.invalid";

const meta: Meta<typeof TransitView> = {
    title: "Transit/TransitView",
    component: TransitView,
    tags: ["autodocs"],
    parameters: transitPageParameters,
    decorators: [withTransitFrame],
    args: {
        network: sampleNetwork,
        worldMapUrl: SAMPLE_WORLD_MAP_URL,
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

// C: 開いた直後。出発を選んでいる。駅が無いので、ブロックの風景に「どこへ行きますか？」 (Figma C4)
export const PickFrom: Story = {};

// B: 街の駅でない駅 (紅島) が出発のとき。写真ではなく駅を中心にした地図を見出しに敷く
export const NonTownStation: Story = {
    args: { search: { from: "bnii" } },
};

// 地図の取得元が分からないときは、街の駅でない駅の駅名をブロックの風景の上に出す
export const NonTownStationWithoutMap: Story = {
    args: { search: { from: "bnii" }, worldMapUrl: null },
};

// A: 出発 (もりもと) が決まり、到着を選んでいる。見出しは街の写真。もりもとを通る路線が上で、いちばん上は写真つき (Figma 路線-1)
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

// 街の駅でない駅の地図のときも、入力中は背景を細くして駅を戻るピルの高さまで上げる
export const SearchTypingOnMap: Story = {
    args: { search: { from: "bnii", mode: "search", q: "もり" } },
};

// 駅を選ぶ前に入力中。ブロックの風景も細くなり、あいさつは隠れる
export const SearchTypingOnLandscape: Story = {
    args: { search: { mode: "search", q: "もり" } },
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
