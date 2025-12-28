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
                "'Satoshi-Variable', 'GenJyuuGothicLP', BlinkMacSystemFont, 'Noto Sans JP', -apple-system, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
            fontVariationSettings: "'wght' 600",
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
    ...textStyles,
});

export default defineConfig({
    globalCss,
    preflight: true,

    include: ["./app/**/*.{ts,tsx,js,jsx}"],

    globalFontface: {
        "Satoshi-Variable": [
            {
                src: 'url("/assets/fonts/Satoshi-Variable.woff2") format("woff2"), url("/assets/fonts/Satoshi-Variable.woff") format("woff"), url("/assets/fonts/Satoshi-Variable..ttf") format("truetype")',
                fontWeight: "400",
                fontDisplay: "swap",
                fontStyle: "normal",
            },
            {
                src: 'url("/assets/fonts/Satoshi-Variable.woff2") format("woff2"), url("/assets/fonts/Satoshi-Variable.woff") format("woff"), url("/assets/fonts/Satoshi-Variable..ttf") format("truetype")',
                fontWeight: "500",
                fontDisplay: "swap",
                fontStyle: "normal",
            },
            {
                src: 'url("/assets/fonts/Satoshi-Variable.woff2") format("woff2"), url("/assets/fonts/Satoshi-Variable.woff") format("woff"), url("/assets/fonts/Satoshi-Variable..ttf") format("truetype")',
                fontWeight: "600",
                fontDisplay: "swap",
                fontStyle: "normal",
            },
            {
                src: 'url("/assets/fonts/Satoshi-Variable.woff2") format("woff2"), url("/assets/fonts/Satoshi-Variable.woff") format("woff"), url("/assets/fonts/Satoshi-Variable..ttf") format("truetype")',
                fontWeight: "800",
                fontDisplay: "swap",
                fontStyle: "normal",
            },
        ],
    },

    jsxFramework: "react",
    outdir: "styled-system",
});
