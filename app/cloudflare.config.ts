import { bindings, defineConfig } from "cf/config";

export default defineConfig({
    worker: {
        name: "moripath",
        compatibilityDate: "2025-12-13",
        compatibilityFlags: ["nodejs_compat", "global_fetch_strictly_public"],
        entrypoint: "@tanstack/react-start/server-entry",
        // workers.dev でのみ公開する
        workersDev: true,
        // PR ごとの preview 用
        previewUrls: true,
        observability: {
            enabled: true,
        },
        env: {
            CLIENT_ID: bindings.text("01a15d07-5d72-76da-83d5-09c6794ddfdc"),
            // secrets は `cf deploy --secrets-file` でアップロードする
            AUTH_SECRET: bindings.secret(),
            // `${SERVER_URL}servers` からサーバー一覧と認証サーバーを解決する
            SERVER_URL: bindings.secret(),
            // プレイヤー情報・画像 API
            MC_API_URL: bindings.secret(),
            ASSETS: bindings.assets(),
        },
    },
});
