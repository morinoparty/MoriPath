import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getAuth } from "./auth";

export const authMiddleware = createMiddleware().server(
    async ({ next, request }) => {
        const auth = await getAuth();
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            throw redirect({ to: "/auth/sign-in" });
        }

        return next();
    },
);
