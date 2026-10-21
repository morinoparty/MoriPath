import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "../../../../../lib/auth";

// MineAuth の認可エンドポイントへのリダイレクト URL を組み立てる。
// better-auth 1.7 以降、genericOAuth のプロバイダーは signInSocial で扱う。
// 要求するスコープは lib/auth.ts のプロバイダー設定に持たせている。
// PKCE の code_verifier などは Better Auth が state クッキーに保存する
export const signInAction = createServerFn().handler(async () => {
    const auth = await getAuth();
    const result = await auth.api.signInSocial({
        body: {
            provider: "MineAuth",
            callbackURL: "/",
        },
    });
    return { redirectUrl: result.url };
});
