import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "../auth";

// oxlint-disable-next-line typescript/no-explicit-any -- request is not typed
export const getSession = createServerFn().handler(async ({ request }: any) => {
    const auth = await getAuth();
    const session = await auth.api.getSession({
        headers: request.headers,
    });
    return session;
});

export type SessionData = Awaited<ReturnType<typeof getSession>>;
