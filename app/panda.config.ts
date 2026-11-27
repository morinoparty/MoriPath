import { createPreset, stone } from "@morinoparty/chlorophyll-react/preset";
import {
    type Config,
    defineConfig,
    defineGlobalStyles,
    defineTextStyles,
} from "@pandacss/dev";
import type { TextStyles } from "@pandacss/types";

export const textStyles: TextStyles = defineTextStyles({
    body: {
        description: "The body text style - used in paragraphs",
        value: {
            fontFamily:
                "'Satoshi', 'GenJyuuGothicLP', BlinkMacSystemFont, 'Noto Sans JP', -apple-system, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
            fontSize: {
                base: "sm",
                md: "md",
                lg: "lg",
            },
            color: "colorPalette.fg",
            lineHeight: "1.8",
            fontWeight: "500",
        },
    },
});

// 表示名 (プレイヤー名など大きく見せる英字) 用の書体。
// Outfit は __root.tsx / Storybook の preview-head.html で外部 CSS として読み込む
const displayTextStyles: TextStyles = defineTextStyles({
    display: {
        description: "The display text style - used for large player names",
        value: {
            fontFamily: "display",
            fontWeight: "600",
            lineHeight: "1.05",
            letterSpacing: "-0.01em",
        },
    },
});

const globalCss = defineGlobalStyles({
    "*::selection": {
        bg: "colorPalette.5",
    },
    "*:focus-visible": {
        outline: "2px solid",
        outlineColor: "colorPalette.9",
        outlineOffset: "2px",
        borderRadius: "md",
    },
    // data-color-palette 未設定時の既定パレット
    ":root": {
        colorPalette: "mori",
    },
    // data-color-palette 属性に colorPalette を追従させる
    ':root[data-color-palette="umi"]': {
        colorPalette: "umi",
    },
    ...textStyles,
});

const config: Config = defineConfig({
    globalCss,
    preflight: true,

    presets: [
        "@pandacss/preset-panda",
        createPreset({ brandColor: "mori", grayColor: stone, radius: "lg" }),
    ],

    include: ["./src/**/*.{ts,tsx,js,jsx}"],

    theme: {
        extend: {
            tokens: {
                fonts: {
                    // 英字は Outfit、和文は本文と同じ源柔ゴシックにフォールバックする
                    display: {
                        value: "'Outfit', 'GenJyuuGothicLP', BlinkMacSystemFont, 'Noto Sans JP', -apple-system, Segoe UI, Roboto, Helvetica Neue, sans-serif",
                    },
                },
            },
            semanticTokens: {
                shadows: {
                    // TabBar などページの上に浮かぶ白いクロム用の影 (カードには使わない)
                    chrome: {
                        value: "0 8px 24px 0 rgb(0 0 0 / 0.12)",
                    },
                },
            },
            textStyles: displayTextStyles,
        },
    },

    // chlorophyll の variant は静的抽出できないため全 variant を生成する
    staticCss: {
        recipes: {
            button: ["*"],
            card: ["*"],
            checkbox: ["*"],
            iconButton: ["*"],
            menu: ["*"],
            playerAvatar: ["*"],
            playerAvatarGroup: ["*"],
            playerMap: ["*"],
            skeleton: ["*"],
            skinViewer: ["*"],
            spinner: ["*"],
            stat: ["*"],
            timeline: ["*"],
        },
    },

    jsxFramework: "react",
    outdir: "styled-system",
});

export default config;
