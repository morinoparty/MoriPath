import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
    stories: ["../app/**/*.stories.tsx"],
    addons: [
        "@chromatic-com/storybook",
        "@storybook/addon-a11y",
        "@storybook/addon-docs",
        "@storybook/addon-themes",
    ],
    core: {
        builder: "@storybook/builder-vite",
    },
    framework: {
        name: "@storybook/react-vite",
        options: {
            builder: {
                viteConfigPath: "vite.storybook.config.ts",
            },
        },
    },
    // biome-ignore lint/suspicious/noExplicitAny: viteFinalの型定義が見つからない
    viteFinal: async (config: any) => {
        config.esbuild = {
            ...config.esbuild,
            jsx: "automatic",
        };
        config.optimizeDeps = {
            ...config.optimizeDeps,
            exclude: [
                "cloudflare:workers",
                "node_modules/.cache/storybook",
                "node_modules/.cache/sb-vite-plugin-externals",
                // TanStack Start のサーバーサイド専用エントリは Storybook では解決不要なので
                "#tanstack-router-entry",
                "#tanstack-start-entry",
                "tanstack-start-manifest:v",
                "tanstack-start-injected-head-scripts:v",
            ],
        };
        config.resolve = {
            ...(config.resolve ?? {}),
            alias: {
                ...(config.resolve?.alias ?? {}),
                "node:async_hooks": fileURLToPath(
                    new URL("./shims/async-hooks.ts", import.meta.url),
                ),
                "cloudflare:workers": fileURLToPath(
                    new URL("./shims/cloudflare-workers.ts", import.meta.url),
                ),
            },
        };
        return config;
    },
};
export default config;
