import path from "node:path";
import pandacss from "@pandacss/dev/postcss";
import viteReact from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import svgr from "vite-plugin-svgr";
import { defineConfig, lazyPlugins, loadEnv } from "vite-plus";

export default defineConfig(({ mode }) => {
    // 接頭辞を空にすると全環境変数が Vite Task のキャッシュキーに入り、CI で毎回ミスするため絞る
    const env = loadEnv(mode, process.cwd(), ["STORYBOOK_", "VITE_"]);
    process.env = { ...process.env, ...env };
    return {
        mode: "development",
        resolve: {
            alias: {
                "@": path.resolve(import.meta.dirname, "../app/src"),
                // chlorophyll-react が参照する styled-system を app 側の出力先に解決する
                "styled-system": path.resolve(
                    import.meta.dirname,
                    "../app/styled-system",
                ),
            },
            tsconfigPaths: true,
        },
        css: {
            postcss: {
                plugins: [autoprefixer, pandacss],
            },
        },
        // chlorophyll-react は生の TSX を配布しているため、事前バンドルでも JSX を automatic で変換する
        optimizeDeps: {
            rolldownOptions: {
                transform: { jsx: "react-jsx" },
            },
        },
        base: "./",
        // lint / fmt など設定値だけを読むコマンドではプラグインを初期化しない
        plugins: lazyPlugins(() => [viteReact(), svgr()]),

        build: {
            minify: false,
        },
    };
});
