import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getAuth } from "./auth";
import { isAuthServerUnavailable } from "./auth-server-unavailable";
import { redirectToUnavailable } from "./unavailable-redirect";

/** 案内ページから戻るパス。サーバー関数の呼び出しでは URL が関数のものなので、元の画面 (Referer) を使う */
function resolveReturnPath(request: Request): string | undefined {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/_serverFn")) {
        return `${url.pathname}${url.search}`;
    }
    const referer = request.headers.get("referer");
    if (!referer) {
        return undefined;
    }
    const refererUrl = new URL(referer);
    return refererUrl.origin === url.origin
        ? `${refererUrl.pathname}${refererUrl.search}`
        : undefined;
}

export const authMiddleware = createMiddleware().server(
    async ({ next, request }) => {
        let auth: Awaited<ReturnType<typeof getAuth>>;
        try {
            auth = await getAuth();
        } catch (error) {
            // MineAuth に届かずセッションを確かめられないときは、サインインへ回さず案内ページへ送る
            if (isAuthServerUnavailable(error)) {
                throw redirectToUnavailable(resolveReturnPath(request));
            }
            throw error;
        }
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            throw redirect({ to: "/auth/sign-in" });
        }

        return next();
    },
);
