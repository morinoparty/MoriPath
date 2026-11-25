import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "../auth";
import { isAuthServerUnavailable } from "../auth-server-unavailable";

async function readSession(headers: Headers) {
    const auth = await getAuth();
    return auth.api.getSession({ headers });
}

/** サインイン中のセッション。サインインしていなければ null */
export type SessionData = Awaited<ReturnType<typeof readSession>>;

/** セッションの確認結果。MineAuth に届かず確かめられないときは authServerUnavailable を立てる */
export type SessionResult =
    | { session: SessionData; authServerUnavailable: false }
    | { session: null; authServerUnavailable: true };

// 例外のクラスはブラウザへの受け渡しで失われるため、届かないことは値で返す
export const getSession = createServerFn().handler(
    // oxlint-disable-next-line typescript/no-explicit-any -- request is not typed
    async ({ request }: any): Promise<SessionResult> => {
        try {
            const session = await readSession(request.headers);
            return { session, authServerUnavailable: false };
        } catch (error) {
            if (isAuthServerUnavailable(error)) {
                return { session: null, authServerUnavailable: true };
            }
            throw error;
        }
    },
);
