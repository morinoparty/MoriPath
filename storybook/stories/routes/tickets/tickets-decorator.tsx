import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Decorator } from "@storybook/react";
import { css } from "../../../styled-system/css";
import { craftheadAvatarUrl } from "../../sample-players";

/** お問い合わせの画面のストーリー共通の枠。アバターは crafthead.net から引く */
export const withTicketProviders: Decorator = (Story) => (
    <MinecraftProvider config={{ avatarUrl: craftheadAvatarUrl }}>
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

/** 何もしない操作。ストーリーでは状態を args で切り替える */
export const noop = () => {};
