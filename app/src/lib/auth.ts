import { env } from "cloudflare:workers";
import { getRequest } from "@tanstack/react-start/server";
import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

type Auth = ReturnType<typeof betterAuth>;

// baseURL(= リクエストの origin)ごとに BetterAuth インスタンスをメモ化する。
// 固定の REDIRECT_AUTH_URL を持たないことで、production / PR ごとの
// preview バージョン / ローカル開発のどの origin でもそのまま動く
const authCache = new Map<string, Promise<Auth>>();

async function buildAuth(baseURL: string): Promise<Auth> {
    // AUTH_SECRET は Cloudflare Secrets Store バインディング (BSM: shared/AUTH_SECRET) から
    // 供給されるため、他の env とは異なり非同期の `.get()` で読み出す必要がある。
    // (Secrets Store バインディングは workerd の global scope での非同期I/Oを許可しないため、
    // モジュールトップレベルではなく初回リクエスト時に遅延解決してキャッシュする)
    const secret = await env.AUTH_SECRET.get();

    // BetterAuthの設定
    // TanStack Start との連携のために tanstackStartCookies プラグインを最後に追加する
    return betterAuth({
        baseURL,
        secret,
        plugins: [
            genericOAuth({
                config: [
                    {
                        providerId: "MineAuth",
                        clientId: env.CLIENT_ID,
                        // token_endpoint_auth_method: "none" のため空文字列
                        clientSecret: "",
                        pkce: true,
                        discoveryUrl: `${env.MAIN_SERVER_URL}/.well-known/openid-configuration`,
                    },
                ],
            }),
            // Better Auth 公式の TanStack Start 向けクッキープラグイン
            tanstackStartCookies(),
        ],
    });
}

/**
 * 現在のリクエストの origin を baseURL としたメモ化済み BetterAuth インスタンスを返す。
 * リクエストコンテキスト内(サーバー関数・ルートハンドラー)からのみ呼び出せる。
 * 呼び出し側は必ず await すること。
 */
export function getAuth(): Promise<Auth> {
    const origin = new URL(getRequest().url).origin;
    let auth = authCache.get(origin);
    if (!auth) {
        auth = buildAuth(origin);
        authCache.set(origin, auth);
    }
    return auth;
}
