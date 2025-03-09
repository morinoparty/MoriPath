import {
    defineConfig,
    defineGlobalStyles,
    defineTextStyles,
} from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";
import grass from "@park-ui/panda-preset/colors/grass";
import neutral from "@park-ui/panda-preset/colors/neutral";

export const textStyles = defineTextStyles({
    body: {
        description: "The body text style - used in paragraphs",
        value: {
            fontFamily:
                "var(--font-poppins), var(--font-noto-sans-jp), Fluent Emoji Color",
            fontSize: {
                base: "sm",
                md: "md",
                lg: "lg",
            },
            textDecoration: {
                color: "var(--colors-text)",
            },
            lineHeight: "1.8",
            fontWeight: "400",
        },
    },
});

const globalCss = defineGlobalStyles({
    "*::selection": {
        bg: "var(--colors-color-palette-6)/80",
    },
    "*:focus-visible": {
        outline: "none",
    },
});

export default defineConfig({
    globalCss,

    preflight: true,

    presets: [
        createPreset({
            accentColor: grass,
            grayColor: neutral,
            radius: "xl",
        }),
    ],

    include: [
        "./src/components/**/*.{ts,tsx,js,jsx}",
        "./src/app/**/*.{ts,tsx,js,jsx}",
    ],

    theme: {
        extend: {
            tokens: {
                colors: {
                    primary: { value: "#539676" },
                    primary90: { value: "rgba(83, 150, 118, 0.9)" },
                    primary70: { value: "rgba(83, 150, 118, 0.7)" },
                    primary50: { value: "rgba(83, 150, 118, 0.5)" },
                    primary10: { value: "rgba(83, 150, 118, 0.1)" },
                    primary5: { value: "rgba(83, 150, 118, 0.05)" },
                    text: { value: "#41765D" },
                    highlight: { value: "#EFF6F2" },
                    background: { value: "#EAF2EF" },
                    background50: { value: "rgba(234, 242, 239, 0.5)" },
                    white20: { value: "rgba(255, 255, 255, 0.2)" },
                    white40: { value: "rgba(255, 255, 255, 0.4)" },
                    white60: { value: "rgba(255, 255, 255, 0.6)" },
                    bg: { base: { value: "#EAF2EF" } },
                },
                sizes: {
                    header: {
                        height: { value: "48px" },
                        width: { value: "96px" },
                    },
                    footer: {
                        height: { value: "64px" },
                    },
                },
            },
            textStyles,
        },
    },

    jsxFramework: "react",
    outdir: "styled-system",
});
