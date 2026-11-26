import type { Meta, StoryObj } from "@storybook/react";
import {
    TownHeroBackground,
    TownHeroLogo,
} from "@/routes/_signed_in/map/transit/-components/town-hero";
import { towns } from "@/routes/_signed_in/map/transit/-functions/town-stations";
import type { Town } from "@/routes/_signed_in/map/transit/-types/town";
import { css } from "../../../styled-system/css";
import { transitPageParameters, withTransitFrame } from "./transit-decorator";

/** 写真の層とロゴを、ページと同じ重ね方で見せる */
const TownHeroPreview = ({
    town,
    compact,
}: {
    town: Town;
    compact: boolean;
}) => (
    <div
        className={css({
            position: "relative",
            height: "420px",
            paddingX: "6",
            paddingTop: "4",
            overflowX: "clip",
        })}
    >
        <TownHeroBackground town={town} compact={compact} />
        <div
            className={css({
                position: "relative",
                zIndex: 1,
                paddingTop: "10",
            })}
        >
            <TownHeroLogo town={town} compact={compact} />
        </div>
    </div>
);

const meta: Meta<typeof TownHeroPreview> = {
    title: "Transit/TownHero",
    component: TownHeroPreview,
    parameters: transitPageParameters,
    decorators: [withTransitFrame],
    args: { compact: false },
};

export default meta;

type Story = StoryObj<typeof TownHeroPreview>;

export const Morimoto: Story = { args: { town: towns.morimoto } };
export const Umimoto: Story = { args: { town: towns.umimoto } };
export const Kamimori: Story = { args: { town: towns.kamimori } };
export const Sekkakyo: Story = { args: { town: towns.sekkakyo } };
export const Atsumori: Story = { args: { town: towns.atsumori } };

// 検索の入力中は写真を細くしてロゴを隠す
export const Compact: Story = {
    args: { town: towns.morimoto, compact: true },
};
