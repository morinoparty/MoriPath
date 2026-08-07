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
    // 既定パレット。SSR 直後(data-color-palette 未設定)でも mori で描画する
    ":root": {
        colorPalette: "mori",
    },
    // data-color-palette 属性(app/components/ui/palette.tsx が設定)に
    // Panda 側の colorPalette を追従させる
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

    // chlorophyll のコンポーネントは node_modules 配下の生 TSX から
    // 実行時に variant を受け取るため、静的抽出できない
    // 全 variant の CSS を生成しておく
    staticCss: {
        recipes: {
            button: ["*"],
            playerMap: ["*"],
        },
    },

    jsxFramework: "react",
    outdir: "styled-system",
});
