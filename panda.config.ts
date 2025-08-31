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
                "'Satoshi-Variable', 'Zen Kaku Gothic New', BlinkMacSystemFont, 'Noto Sans JP', -apple-system, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
            fontVariationSettings: "'wght' 500",
            fontSize: {
                base: "sm",
                md: "md",
                lg: "lg",
            },
            textDecoration: {
                color: "var(--colors-text)",
            },
            lineHeight: "1.8",
            fontWeight: "500",
        },
    },
});

const globalCss = defineGlobalStyles({
    "*::selection": {
        bg: "var(--colors-color-palette-1)/80",
    },
    "*:focus-visible": {
        outline: "2px solid var(--colors-primary)",
        outlineOffset: "2px",
        borderRadius: "var(--radii-md)",
    },
});

export default defineConfig({
    globalCss,

    preflight: true,

    include: [
        "./src/components/**/*.{ts,tsx,js,jsx}",
        "./src/app/**/*.{ts,tsx,js,jsx}",
    ],

    theme: {
        extend: {
            textStyles,
        },
    },

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
                fontWeight: "900",
                fontDisplay: "swap",
                fontStyle: "normal",
            },
        ],
    },

    jsxFramework: "react",
    outdir: "styled-system",
});
