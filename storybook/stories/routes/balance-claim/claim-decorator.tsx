import type { Decorator } from "@storybook/react";
import { css } from "../../../styled-system/css";

/** 保護ブロックを買う画面のストーリー共通の枠 (画面の地の色を敷く) */
export const withClaimFrame: Decorator = (Story) => (
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
);

/** 何もしない操作。ストーリーでは状態を args で切り替える */
export const noop = () => {};

/** Figma のモックと同じ、いまの保護ブロックと残高 (単価 10 どんぐりは見本の値) */
export const sampleCurrent = {
    balance: 12480,
    remainingClaimBlocks: 1240,
    unitPrice: 10,
};
