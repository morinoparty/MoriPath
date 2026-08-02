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
            color: "var(--chakra-colors-color-palette-fg)",
            textDecoration: {
                color: "var(--chakra-colors-text)",
            },
            lineHeight: "1.8",
            fontWeight: "500",
        },
    },
});

const globalCss = defineGlobalStyles({
    "*::selection": {
        bg: "var(--chakra-colors-color-palette-300)/80",
    },
    "*:focus-visible": {
        outline: "2px solid var(--chakra-colors-primary)",
        outlineOffset: "2px",
        borderRadius: "var(--radii-md)",
    },
    // data-color-palette 属性(app/components/ui/palette.tsx が設定)に
    // Panda 側の colorPalette を追従させる
    ':root[data-color-palette="mori"]': {
        colorPalette: "mori",
    },
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

    // chlorophyll の Button は実行時に variant を受け取るため、
    // 静的抽出できない全 variant の CSS を生成しておく
    staticCss: {
        recipes: {
            button: ["*"],
        },
    },

    jsxFramework: "react",
    outdir: "styled-system",
});
