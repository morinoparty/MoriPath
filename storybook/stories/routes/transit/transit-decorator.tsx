import type { Decorator } from "@storybook/react";
import { css } from "../../../styled-system/css";

/** 乗換案内のストーリー共通の枠。アプリの Layout と同じ幅と地の色にする */
export const withTransitFrame: Decorator = (Story) => (
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
);

/** 部品のストーリー用の枠。ページの左右の余白を付ける */
export const withTransitPadding: Decorator = (Story) => (
    <div
        className={css({
            maxWidth: "md",
            margin: "0 auto",
            padding: "6",
            bg: "colorPalette.bg",
            color: "colorPalette.fg",
            textStyle: "body",
        })}
    >
        <Story />
    </div>
);

/** ページ全体のストーリーの parameters (sticky なボタンがあるので iframe に分けて表示する) */
export const transitPageParameters = {
    layout: "fullscreen",
    docs: { story: { inline: false, iframeHeight: 874 } },
} as const;
