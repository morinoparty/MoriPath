import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "../../../../../lib/auth";
import { AuthServerUnavailableError } from "../../../../../lib/auth-server-unavailable";
import {
    AUTH_HANDLER_TIMEOUT_MS,
    withTimeout,
} from "../../../../../lib/mineauth-timeout";
import { UNAVAILABLE_PATH } from "../../../../../lib/unavailable-redirect";

// つながらないときは、案内ページからサインインをやり直せるようにする
const UNAVAILABLE_REDIRECT_URL = `${UNAVAILABLE_PATH}?${new URLSearchParams({ redirect: "/auth/sign-in" })}`;

// MineAuth の認可 URL を返す。スコープは lib/auth.ts で設定する
export const signInAction = createServerFn().handler(async () => {
    try {
        const auth = await getAuth();
        // discovery に失敗していると、ここで取り直しに行くため上限を設ける
        const result = await withTimeout(
            auth.api.signInSocial({
                body: {
                    provider: "MineAuth",
                    callbackURL: "/",
                },
            }),
            AUTH_HANDLER_TIMEOUT_MS,
            () => new AuthServerUnavailableError(),
        );
        return { redirectUrl: result.url };
    } catch (error) {
        // 例外はブラウザへの受け渡しでクラスが失われるため、案内ページの URL を値で返す
        console.error("MineAuth のサインインを始められません:", error);
        return { redirectUrl: UNAVAILABLE_REDIRECT_URL };
    }
});
