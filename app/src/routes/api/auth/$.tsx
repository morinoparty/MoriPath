import { createFileRoute } from "@tanstack/react-router";
import { getAuth } from "../../../lib/auth";
import {
    AuthServerUnavailableError,
    isAuthServerUnavailable,
} from "../../../lib/auth-server-unavailable";
import {
    AUTH_HANDLER_TIMEOUT_MS,
    withTimeout,
} from "../../../lib/mineauth-timeout";
import { UNAVAILABLE_PATH } from "../../../lib/unavailable-redirect";

/** Better Auth に渡す。コールバックのトークン交換などで MineAuth が応答しなければ打ち切る */
async function handleAuthRequest(request: Request): Promise<Response> {
    try {
        const auth = await getAuth();
        return await withTimeout(
            auth.handler(request),
            AUTH_HANDLER_TIMEOUT_MS,
            () => new AuthServerUnavailableError(),
        );
    } catch (error) {
        if (!isAuthServerUnavailable(error)) {
            throw error;
        }
        // 画面の遷移 (コールバックなど) は案内ページへ送り、サインインからやり直せるようにする
        if (request.method === "GET") {
            const location = `${UNAVAILABLE_PATH}?${new URLSearchParams({ redirect: "/auth/sign-in" })}`;
            return new Response(null, {
                status: 302,
                headers: { Location: location },
            });
        }
        return Response.json(
            { error: "auth_server_unavailable" },
            { status: 503 },
        );
    }
}

export const Route = createFileRoute("/api/auth/$")({
    server: {
        handlers: {
            GET: ({ request }) => handleAuthRequest(request),
            POST: ({ request }) => handleAuthRequest(request),
        },
    },
});
