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
                    clientId: env.CLIENT_ID,
                    // token_endpoint_auth_method: "none" のため空文字列
                    clientSecret: "",
                    pkce: true,
                    discoveryUrl: `${env.MAIN_SERVER_URL}/.well-known/openid-configuration`,
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
                            sub: string;
                            name: string;
                            nickname: string;
                            picture: string;
                        };

                        return {
                            id: profile.sub,
                            name: profile.name,
                            email: `${profile.sub}@no-reply.morino.party`,
                            emailVerified: false,
                            image: profile.picture,
                        };
                    },
                },
            ],
        }),
        // Better Auth 公式の TanStack Start 向けクッキープラグイン
        tanstackStartCookies(),
    ],
});
