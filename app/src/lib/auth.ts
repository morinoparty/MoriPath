import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

type Auth = ReturnType<typeof betterAuth>;

let authPromise: Promise<Auth> | null = null;

async function buildAuth(): Promise<Auth> {
    // AUTH_SECRET は Cloudflare Secrets Store バインディング (BSM: shared/AUTH_SECRET) から
    // 供給されるため、他の env とは異なり非同期の `.get()` で読み出す必要がある。
    // (Secrets Store バインディングは workerd の global scope での非同期I/Oを許可しないため、
    // モジュールトップレベルではなく初回リクエスト時に遅延解決してキャッシュする)
    const secret = await env.AUTH_SECRET.get();

    // BetterAuthの設定
    // TanStack Start との連携のために tanstackStartCookies プラグインを最後に追加する
    return betterAuth({
        // biome-ignore lint/style/noNonNullAssertion: if not set, it will throw an error
        baseURL: env.REDIRECT_AUTH_URL!,
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

/** メモ化された BetterAuth インスタンスを返す。呼び出し側は必ず await すること。 */
export function getAuth(): Promise<Auth> {
    if (!authPromise) {
        authPromise = buildAuth();
    }
    return authPromise;
}
