import { bindings, defineConfig } from "cf/config";

export default defineConfig({
    worker: {
        name: "moripath",
        compatibilityDate: "2025-12-13",
        compatibilityFlags: ["nodejs_compat", "global_fetch_strictly_public"],
        entrypoint: "@tanstack/react-start/server-entry",
        // 公開は <name>.morinoparty.workers.dev のみ (カスタムドメインは使わない)
        workersDev: true,
        // PR ごとの preview は `cf previews deploy` で行う
        previewUrls: true,
        observability: {
            enabled: true,
        },
        env: {
            CLIENT_ID: bindings.text("01a15d07-5d72-76da-83d5-09c6794ddfdc"),
            // secrets はデプロイ時に `cf deploy --secrets-file` でアップロードする
            // 値は GitHub リポジトリの Actions secrets に置く
            AUTH_SECRET: bindings.secret(),
            // サーバー一覧と認証サーバーは `${SERVER_URL}servers` から実行時に解決する
            SERVER_URL: bindings.secret(),
            ASSETS: bindings.assets(),
        },
    },
});
