import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "../../../../../lib/auth";

// MineAuth の認可 URL を返す。スコープは lib/auth.ts で設定する
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
