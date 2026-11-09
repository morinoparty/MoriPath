import fs from "node:fs";
import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import pandacss from "@pandacss/dev/postcss";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import { defineConfig, lazyPlugins, type Plugin } from "vite-plus";

// Storybook のビルド成果物を client アセットの /storybook に同梱する
const storybookDir = path.resolve(
    import.meta.dirname,
    "../storybook/storybook-static",
);
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
            // staticDirs 経由で混入する app/public の _headers を除外する
            filter: (src) => path.basename(src) !== "_headers",
        });
    },
});

// chlorophyll-react は生の TSX を配布しているため、事前バンドルでも JSX を automatic で変換する
// Vite が設定オブジェクトを書き換えるため、client と ssr で同じオブジェクトを共有しない
const optimizeDeps = () => ({
    rolldownOptions: {
        transform: { jsx: "react-jsx" as const },
    },
});

export default defineConfig({
    resolve: {
        alias: {
            // chlorophyll-react が bare specifier で参照する styled-system を Panda の outdir に解決する
            "styled-system": path.resolve(import.meta.dirname, "styled-system"),
        },
        tsconfigPaths: true,
    },
    css: {
        postcss: {
            plugins: [pandacss(), autoprefixer],
        },
    },
    optimizeDeps: optimizeDeps(),
    // ssr.optimizeDeps に rolldownOptions を書くと Vite が誤って非推奨警告を出すため環境ごとの設定で指定する
    environments: { ssr: { optimizeDeps: optimizeDeps() } },
    // lint / fmt など設定値だけを読むコマンドではプラグインを初期化しない
    plugins: lazyPlugins(() => [
        // v2 は cloudflare.config.ts を直接読む
        cloudflare({
            viteEnvironment: { name: "ssr" },
        }),
        tanstackStart({
            srcDirectory: "src",
        }),
        viteReact(),
        bundleStorybook(),
    ]),
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
