import { defineConfig } from "@pandacss/dev";
// app の Panda 設定を流用し、抽出対象と出力先だけ差し替える
import appConfig from "../app/panda.config";

export default defineConfig({
    ...appConfig,
    include: [
        "./stories/**/*.{ts,tsx}",
        "./.storybook/**/*.{ts,tsx}",
        "../app/src/**/*.{ts,tsx}",
    ],
    outdir: "styled-system",
});
