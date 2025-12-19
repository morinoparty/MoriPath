import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

// BetterAuthの設定
// TanStack Start との連携のために tanstackStartCookies プラグインを最後に追加する
export const auth = betterAuth({
    // biome-ignore lint/style/noNonNullAssertion: if not set, it will throw an error
    baseURL: env.REDIRECT_AUTH_URL!,
    // biome-ignore lint/style/noNonNullAssertion: if not set, it will throw an error
    secret: env.AUTH_SECRET!,
    plugins: [
        genericOAuth({
            config: [
                {
                    providerId: "MineAuth",
                    authorizationUrl: `${env.MAIN_SERVER_URL}/oauth2/authorize`,
                    tokenUrl: `${env.MAIN_SERVER_URL}/oauth2/token`,
                    userInfoUrl: `${env.MAIN_SERVER_URL}/oauth2/userinfo`,
                    // biome-ignore lint/style/noNonNullAssertion: if not set, it will throw an error
                    clientId: env.CLIENT_ID!,
                    pkce: true,
                    clientSecret: "", // token_endpoint_auth_method: "none" のため空文字列
                    scopes: ["openid", "profile", "email"],
                    authentication: "post", // client_secretをPOSTボディで送信
                    getUserInfo: async (tokens) => {
                        const response = await fetch(
                            `${env.MAIN_SERVER_URL}/oauth2/userinfo`,
                            {
                                headers: {
                                    Authorization: `Bearer ${tokens.accessToken}`,
                                },
                            },
                        );

                        if (!response.ok) {
                            throw new Error("Failed to fetch user info");
                        }

                        const profile = (await response.json()) as {
                            id: string;
                            username: string;
                        };

                        return {
                            id: profile.id,
                            name: profile.username,
                            email: `${profile.id}@no-reply.morino.party`,
                            emailVerified: false,
                            image: `https://crafthead.net/avatar/${profile.id}`,
                        };
                    },
                },
            ],
        }),
        // Better Auth 公式の TanStack Start 向けクッキープラグイン
        tanstackStartCookies(),
    ],
});
