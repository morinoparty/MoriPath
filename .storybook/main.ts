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
    refs: {
        "@chakra-ui/react": {
            disable: true,
        },
    },
    framework: {
        name: "@storybook/react-vite",
        options: {
            builder: {
                viteConfigPath: "vite.storybook.config.ts",
            },
        },
    },
    staticDirs: [{ from: "../public/assets", to: "/assets" }],
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
            ],
            esbuildOptions: {
                ...config.optimizeDeps?.esbuildOptions,
                external: [
                    ...(config.optimizeDeps?.esbuildOptions?.external ?? []),
                    "#tanstack-router-entry",
                    "#tanstack-start-entry",
                ],
            },
        };
        config.resolve = {
            ...(config.resolve ?? {}),
            alias: {
                ...(config.resolve?.alias ?? {}),
                // TanStack Start の内部/仮想モジュールは Storybook では不要なのでスタブへ解決する
                // better-authのせい
                "#tanstack-router-entry": fileURLToPath(
                    new URL(
                        "./shims/tanstack-router-entry.ts",
                        import.meta.url,
                    ),
                ),
                "#tanstack-start-entry": fileURLToPath(
                    new URL("./shims/tanstack-start-entry.ts", import.meta.url),
                ),
                "tanstack-start-manifest:v": fileURLToPath(
                    new URL(
                        "./shims/tanstack-start-manifest.ts",
                        import.meta.url,
                    ),
                ),
                "tanstack-start-injected-head-scripts:v": fileURLToPath(
                    new URL(
                        "./shims/tanstack-start-injected-head-scripts.ts",
                        import.meta.url,
                    ),
                ),
                "@tanstack/router-core/ssr/server": fileURLToPath(
                    new URL(
                        "./shims/tanstack-router-core-ssr-server.ts",
                        import.meta.url,
                    ),
                ),
                "@tanstack/react-router/ssr/server": fileURLToPath(
                    new URL(
                        "./shims/tanstack-react-router-ssr-server.ts",
                        import.meta.url,
                    ),
                ),
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
