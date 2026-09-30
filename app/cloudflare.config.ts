import { bindings, defineConfig } from "cf/config";

export default defineConfig({
    worker: {
        name: "moripath",
        compatibilityDate: "2025-12-13",
        compatibilityFlags: ["nodejs_compat", "global_fetch_strictly_public"],
        entrypoint: "@tanstack/react-start/server-entry",
        // PR ごとの preview は `cf workers versions create` の未昇格バージョン + preview URL で行う
        previewUrls: true,
        observability: {
            enabled: true,
        },
        env: {
            CLIENT_ID: bindings.text("019fc686-49f0-7442-84d5-af12e3a4734e"),
            // secrets はデプロイ時に `cf deploy --secrets-file` でアップロードする
            // 値は GitHub リポジトリの Actions secrets に置く
            AUTH_SECRET: bindings.secret(),
            MAIN_SERVER_URL: bindings.secret(),
            SERVER_URL: bindings.secret(),
            SERVERS: bindings.secret(),
            ASSETS: bindings.assets(),
        },
    },
});
