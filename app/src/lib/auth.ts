import { env } from "cloudflare:workers";
import { getRequest } from "@tanstack/react-start/server";
import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { AuthServerUnavailableError } from "./auth-server-unavailable";
import {
    ACCESS_TOKEN_TIMEOUT_MS,
    AUTH_HANDLER_TIMEOUT_MS,
    withTimeout,
} from "./mineauth-timeout";
import { getAuthServerUrl } from "./server-list";

// プラグイン込みのエンドポイント型を保つため buildAuth の戻り値から推論する
export type Auth = Awaited<ReturnType<typeof buildAuth>>;

// origin ごとに動かすため、origin と認証サーバーの組でインスタンスをメモ化する
const authCache = new Map<string, Promise<Auth>>();

async function buildAuth(baseURL: string, authServerUrl: string) {
    const secret = env.AUTH_SECRET;

    // DB-less 構成: isolate が入れ替わってもログインを保つため、セッションとトークンを暗号化クッキーに保存する
    return betterAuth({
        baseURL,
        secret,
        session: {
            // refresh token の寿命 (30日) に合わせる
            expiresIn: 60 * 60 * 24 * 30,
            cookieCache: {
                enabled: true,
                // DB-less ではこれが実質のセッション上限になる
                maxAge: 60 * 60 * 24 * 30,
            },
        },
        account: {
            // getAccessToken で access token を自動更新できるようトークンをクッキーに保存する
            storeAccountCookie: true,
        },
        plugins: [
            // MineAuth 側のリダイレクト URI は <origin>/api/auth/callback/MineAuth
            genericOAuth({
                config: [
                    {
                        providerId: "MineAuth",
                        clientId: env.CLIENT_ID,
                        // MineAuth のクライアントは public client
                        tokenEndpointAuth: { method: "none" },
                        pkce: true,
                        // サーバー関数経由の signOut ではリダイレクトできないため、クッキーの削除だけにする
                        disableProviderLogout: true,
                        discoveryUrl: `${authServerUrl}/.well-known/openid-configuration`,
                        scopes: [
                            "openid",
                            "profile",
                            "email",
                            "roles",
                            "plugin",
                        ],
                    },
                ],
            }),
            // 最後に置く必要がある
            tanstackStartCookies(),
        ],
    });
}

/** リクエストコンテキスト内からのみ呼び出せる */
export async function getAuth(): Promise<Auth> {
    // リクエストコンテキストを失わないよう await より前に呼ぶ
    const origin = new URL(getRequest().url).origin;
    const authServerUrl = await getAuthServerUrl();
    const cacheKey = `${origin}|${authServerUrl}`;
    let pending = authCache.get(cacheKey);
    if (!pending) {
        pending = buildAuth(origin, authServerUrl);
        authCache.set(cacheKey, pending);
    }
    const auth = await pending;
    // 初期化で MineAuth の discovery を取りに行き、Better Auth はそこに上限を設けないため、ここで区切る
    try {
        await withTimeout(
            auth.$context,
            AUTH_HANDLER_TIMEOUT_MS,
            () => new AuthServerUnavailableError(),
        );
    } catch (error) {
        // 止まったままのインスタンスを使い回さないよう、次のリクエストで作り直す
        if (authCache.get(cacheKey) === pending) {
            authCache.delete(cacheKey);
        }
        throw error;
    }
    return auth;
}

/**
 * MineAuth のアクセストークン。失効していれば refresh token で更新する。
 * 更新先の MineAuth が応答しないときに待ち続けないよう、上限を過ぎたら例外にする
 */
export async function getMineAuthAccessToken(headers: Headers) {
    const auth = await getAuth();
    return withTimeout(
        auth.api.getAccessToken({
            body: { useAccountCookie: true },
            headers,
        }),
        ACCESS_TOKEN_TIMEOUT_MS,
        () => new Error("アクセストークンの取得が時間内に終わりませんでした"),
    );
}
