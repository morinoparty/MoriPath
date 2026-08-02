import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "../auth";

// Better Auth + TanStack Start 公式ドキュメントに倣い、request.headers を渡してセッションを取得する
// biome-ignore lint/suspicious/noExplicitAny: request is not typed
export const getSession = createServerFn().handler(async ({ request }: any) => {
    const auth = await getAuth();
    const session = await auth.api.getSession({
        headers: request.headers,
    });
    return session;
});

export type SessionData = Awaited<ReturnType<typeof getSession>>;
