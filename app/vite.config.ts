import fs from "node:fs";
import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import pandacss from "@pandacss/dev/postcss";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import { defineConfig, type Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// storybook パッケージのビルド成果物 (storybook-static) を
// client のアセットとして /storybook 配下に同梱する
const storybookDir = path.resolve(__dirname, "../storybook/storybook-static");
const bundleStorybook = (): Plugin => ({
    name: "moripath:bundle-storybook",
    apply: "build",
    applyToEnvironment: (environment) => environment.name === "client",
    writeBundle() {
        if (!fs.existsSync(storybookDir)) {
            const message = `${storybookDir} が見つからないため Storybook を同梱できません (pnpm build:storybook を先に実行してください)`;
            // CI では Storybook 抜きでデプロイされないよう失敗させる
            if (process.env.CI) this.error(message);
            this.warn(message);
            return;
        }
        const outDir = path.resolve(
            this.environment.config.root,
            this.environment.config.build.outDir,
            "storybook",
        );
        fs.cpSync(storybookDir, outDir, {
            recursive: true,
            // app/public を staticDirs に含めているため、_headers が混入する
            filter: (src) => path.basename(src) !== "_headers",
        });
    },
});

export default defineConfig({
    resolve: {
        alias: {
            // @morinoparty/chlorophyll-react が bare specifier で
            // styled-system/recipes を参照するため、Panda の outdir に解決する
            "styled-system": path.resolve(__dirname, "styled-system"),
        },
    },
    css: {
        postcss: {
            plugins: [pandacss(), autoprefixer],
        },
    },
    // @morinoparty/chlorophyll-react は生の TSX を配布しているため、
    // dep optimizer (esbuild) の JSX 変換を automatic にしないと
    // SSR で `React is not defined` になる
    optimizeDeps: {
        esbuildOptions: {
            jsx: "automatic",
        },
    },
    ssr: {
        optimizeDeps: {
            esbuildOptions: {
                jsx: "automatic",
            },
        },
    },
    plugins: [
        cloudflare({
            viteEnvironment: { name: "ssr" },
            // wrangler.jsonc ではなく cloudflare.config.ts (cf CLI) から設定を読む
            experimental: { newConfig: true },
        }),
        tanstackStart({
            srcDirectory: "src",
        }),
        tsconfigPaths(),
        viteReact(),
        bundleStorybook(),
    ],
    server: {
        port: 3000,
        allowedHosts: [
            "localhost",
            "127.0.0.1",
            "0.0.0.0",
            "192.168.0.148",
            ".trycloudflare.com",
        ],
    },
});
