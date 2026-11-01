import { createPreset, stone } from "@morinoparty/chlorophyll-react/preset";
import {
    defineConfig,
    defineGlobalStyles,
    defineTextStyles,
} from "@pandacss/dev";

export const textStyles = defineTextStyles({
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

export default defineConfig({
    globalCss,
    preflight: true,

    presets: [
        "@pandacss/preset-panda",
        createPreset({ brandColor: "mori", grayColor: stone, radius: "md" }),
    ],

    include: ["./src/**/*.{ts,tsx,js,jsx}"],

    // chlorophyll の variant は静的抽出できないため全 variant を生成する
    staticCss: {
        recipes: {
            button: ["*"],
            playerMap: ["*"],
        },
    },

    jsxFramework: "react",
    outdir: "styled-system",
});
