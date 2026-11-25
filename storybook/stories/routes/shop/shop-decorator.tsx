import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Decorator } from "@storybook/react";
import { css } from "../../../styled-system/css";
import { craftheadAvatarUrl } from "../../sample-players";
import { sampleMinecraftAssetsUrl } from "../../sample-shops";

/** おみせのストーリー共通の枠。アバターは crafthead.net、アイテムは STORYBOOK_MC_ASSETS_URL から引く */
export const withShopProviders: Decorator = (Story) => (
    <MinecraftProvider
        assets={sampleMinecraftAssetsUrl}
        config={{ avatarUrl: craftheadAvatarUrl }}
    >
        <div
            className={css({
                maxWidth: "md",
                margin: "0 auto",
                bg: "colorPalette.bg",
                color: "colorPalette.fg",
                textStyle: "body",
            })}
        >
            <Story />
        </div>
    </MinecraftProvider>
);
