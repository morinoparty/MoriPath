import type { Meta, StoryObj } from "@storybook/react";
import { TransitBackButton } from "@/routes/_signed_in/map/transit/-components/transit-back-button";
import {
    TransitHeroBackground,
    TransitHeroHeadline,
} from "@/routes/_signed_in/map/transit/-components/transit-hero";
import { buildRoutePath } from "@/routes/_signed_in/map/transit/-functions/build-route-path";
import { resolveTransitHero } from "@/routes/_signed_in/map/transit/-functions/resolve-transit-hero";
import type { TransitHero } from "@/routes/_signed_in/map/transit/-types/transit-hero";
import { css } from "../../../styled-system/css";
import { sampleIndex, sampleRoute, sampleStation } from "./sample-transit";
import { transitPageParameters, withTransitFrame } from "./transit-decorator";

// 実際の squaremap の URL はソースに書かないので、見本では届かない URL を使う (タイルは出ず、駅の札と空のグラデーションだけが見える)
const SAMPLE_WORLD_MAP_URL = "https://squaremap.example.invalid";

/** 背景・戻るボタン・見出しを、ページと同じ重ね方で見せる */
const TransitHeroPreview = ({
    hero,
    compact,
}: {
    hero: TransitHero;
    compact: boolean;
}) => (
    <div
        className={css({
            position: "relative",
            // 背景 (874px の画面で 470px) と、それに重なる枠の場所まで見せる
            height: "520px",
            paddingX: "6",
            paddingTop: "4",
            overflowX: "clip",
        })}
    >
        <TransitHeroBackground hero={hero} compact={compact} />
        <TransitBackButton />
        <div
            className={css({
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "3.5",
            })}
        >
            <TransitHeroHeadline hero={hero} compact={compact} />
            {/* 背景が枠 (出発・到着) にどれだけ重なるかを見る目安 */}
            <div
                className={css({
                    height: "98px",
                    borderRadius: "28px",
                    bg: "colorPalette.surface.subtle",
                })}
            />
        </div>
    </div>
);

const meta: Meta<typeof TransitHeroPreview> = {
    title: "Transit/TransitHero",
    component: TransitHeroPreview,
    parameters: transitPageParameters,
    decorators: [withTransitFrame],
    args: { compact: false },
};

export default meta;

type Story = StoryObj<typeof TransitHeroPreview>;

const heroOf = (slug: string | null, worldMapUrl: string | null) =>
    resolveTransitHero(slug ? sampleStation(slug) : null, worldMapUrl);

// A: 街の駅は街の写真と文字ロゴ。写真は白く覆わず、上だけ少し暗く、下だけ地の色へ溶かす
export const Morimoto: Story = {
    args: { hero: heroOf("mrmt", SAMPLE_WORLD_MAP_URL) },
};
export const Umimoto: Story = {
    args: { hero: heroOf("ummt", SAMPLE_WORLD_MAP_URL) },
};
export const Kamimori: Story = {
    args: { hero: heroOf("kmmr", SAMPLE_WORLD_MAP_URL) },
};
export const Sekkakyo: Story = {
    args: { hero: heroOf("sekk", SAMPLE_WORLD_MAP_URL) },
};
export const Atsumori: Story = {
    args: { hero: heroOf("atmn", SAMPLE_WORLD_MAP_URL) },
};

// B: 街の駅でない駅は、駅を中心にした地図と、駅名つきの駅の札 (近くの街の写真では代用しない)
export const StationMap: Story = {
    args: { hero: heroOf("bnii", SAMPLE_WORLD_MAP_URL) },
};

// 出発と到着が決まったら、経路全体が収まる地図に経路の線と出発・到着の札を出す
const routeFrom = sampleStation("mrmt");
const routeTo = sampleStation("sekk");
export const Route: Story = {
    args: {
        hero: {
            kind: "route",
            from: routeFrom,
            to: routeTo,
            // 見本のワールドは出発駅のもの (見本の URL は届かないので、タイルは出ず線と札だけが見える)
            worldId: routeFrom.worldId ?? "minecraft_overworld",
            baseUrl: SAMPLE_WORLD_MAP_URL,
            path: buildRoutePath(
                { status: "ok", route: sampleRoute },
                sampleIndex,
            ),
        },
    },
};

// 地図の取得元が分からないときは、駅名をブロックの風景の上に出す
export const StationLandscape: Story = {
    args: { hero: heroOf("bnii", null) },
};

// C: 駅をまだ選んでいないときは、空とブロックの風景に「どこへ行きますか？」
export const Empty: Story = {
    args: { hero: heroOf(null, SAMPLE_WORLD_MAP_URL) },
};

// 検索の入力中は背景を細くして見出しを隠す (写真・地図・風景のそれぞれ)
export const Compact: Story = {
    args: { hero: heroOf("mrmt", SAMPLE_WORLD_MAP_URL), compact: true },
};

export const CompactMap: Story = {
    args: { hero: heroOf("bnii", SAMPLE_WORLD_MAP_URL), compact: true },
};

export const CompactLandscape: Story = {
    args: { hero: heroOf(null, SAMPLE_WORLD_MAP_URL), compact: true },
};
