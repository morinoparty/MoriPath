import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import pandacss from "@pandacss/dev/postcss";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

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
        cloudflare({ viteEnvironment: { name: "ssr" } }),
        tanstackStart({
            srcDirectory: "src",
        }),
        tsconfigPaths(),
        viteReact(),
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
