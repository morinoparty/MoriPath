import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Decorator } from "@storybook/react";
import { css } from "../../../styled-system/css";
import { craftheadAvatarUrl, samplePlayers } from "../../sample-players";

/** どんぐりを送る画面のストーリー共通の枠。アバターは crafthead.net から引く */
export const withWalletProviders: Decorator = (Story) => (
    <MinecraftProvider config={{ avatarUrl: craftheadAvatarUrl }}>
        <div
            className={css({
                maxWidth: "md",
                margin: "0 auto",
                padding: "4",
                bg: "colorPalette.bg",
                color: "colorPalette.fg",
                textStyle: "body",
            })}
        >
            <Story />
        </div>
    </MinecraftProvider>
);

/** 送り先の候補 (オンラインの人。_NIKOMARU 本人は含めない) */
export const sampleSuggestions = [
    samplePlayers.chocolatt,
    samplePlayers.tututututu201,
    samplePlayers.kina1120,
    samplePlayers.hikighaL,
];

/** 何もしない操作。ストーリーでは状態を args で切り替える */
export const noop = () => {};
