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
        css: {
            postcss: {
                plugins: [autoprefixer, pandacss],
            },
        },
        base: "./",
        plugins: [tsconfigPaths(), viteReact(), svgr()],

        build: {
            minify: false,
        },
    };
});
