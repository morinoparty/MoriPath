import type { Meta, StoryObj } from "@storybook/react";
import { TransitBackButton } from "@/routes/_signed_in/map/transit/-components/transit-back-button";
import { TransitHeroBackground } from "@/routes/_signed_in/map/transit/-components/transit-hero";
import { resolveTransitHero } from "@/routes/_signed_in/map/transit/-functions/resolve-transit-hero";
import { towns } from "@/routes/_signed_in/map/transit/-functions/town-stations";
import type { TransitHero } from "@/routes/_signed_in/map/transit/-types/transit-hero";
import { css } from "../../../styled-system/css";
import { sampleStation } from "./sample-transit";
import { withTransitFrame } from "./transit-decorator";

// 実際の squaremap の URL はソースに書かないので、見本では届かない URL を使う (タイルは出ず、駅の札と空のグラデーションだけが見える)
const SAMPLE_WORLD_MAP_URL = "https://squaremap.example.invalid";

// 背景の高さに合わせた見本の箱。ふつうは写真の上端の暗いかげりまで見えるよう背の高い背景にする
const previewStyle = css({
    position: "relative",
    height: "470px",
    "&[data-compact=true]": { height: "200px" },
});

/** 戻るボタンを、ページと同じく背景の左上に浮かべて見せる */
const TransitBackButtonPreview = ({
    hero,
    compact = false,
}: {
    hero: TransitHero;
    /** 検索の入力中の細い背景にするか */
    compact?: boolean;
}) => (
    <div className={previewStyle} data-compact={compact}>
        <TransitHeroBackground hero={hero} compact={compact} />
        <TransitBackButton />
    </div>
);

const meta: Meta<typeof TransitBackButtonPreview> = {
    title: "Transit/TransitBackButton",
    component: TransitBackButtonPreview,
    parameters: { layout: "fullscreen" },
    decorators: [withTransitFrame],
};

export default meta;

type Story = StoryObj<typeof TransitBackButtonPreview>;

// 街の写真の上でも読めるよう、半透明の面とぼかしを敷く
export const OnPhoto: Story = {
    args: {
        hero: {
            kind: "town",
            town: towns.morimoto,
            station: sampleStation("mrmt"),
        },
    },
};

// 街の駅でない駅の地図の上 (駅の札がボタンの近くに来る)
export const OnMap: Story = {
    args: {
        hero: resolveTransitHero(sampleStation("bnii"), SAMPLE_WORLD_MAP_URL),
    },
};

// ブロックの風景の上 (駅を選んでいないとき・案内のページ)
export const OnLandscape: Story = {
    args: { hero: { kind: "landscape", station: null } },
};

// 検索の入力中の細い背景の上 (風景は線路と電車がピルと枠の間に来る)
export const OnCompactLandscape: Story = {
    args: { hero: { kind: "landscape", station: null }, compact: true },
};
