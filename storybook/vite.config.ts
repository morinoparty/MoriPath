import path from "node:path";
import pandacss from "@pandacss/dev/postcss";
import viteReact from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import { defineConfig, loadEnv } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    process.env = { ...process.env, ...env };
    return {
        mode: "development",
        resolve: {
            alias: {
                // app パッケージのソースを Storybook から参照するための alias
                "@": path.resolve(__dirname, "../app/src"),
                // @morinoparty/chlorophyll-react が bare specifier で
                // styled-system/recipes を参照するため、app 側の Panda outdir に解決する
                "styled-system": path.resolve(
                    __dirname,
                    "../app/styled-system",
                ),
            },
        },
        css: {
            postcss: {
                plugins: [autoprefixer, pandacss],
            },
        },
        // @morinoparty/chlorophyll-react は生の TSX を配布しているため、
        // dep optimizer (esbuild) の JSX 変換を automatic にする
        optimizeDeps: {
            esbuildOptions: {
                jsx: "automatic",
            },
        },
        base: "./",
        plugins: [tsconfigPaths(), viteReact(), svgr()],

        build: {
            minify: false,
        },
    };
});
