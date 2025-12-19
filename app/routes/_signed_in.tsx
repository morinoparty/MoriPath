import { createFileRoute, Outlet } from "@tanstack/react-router";
import { authMiddleware } from "../lib/auth-middleware";
import { getSession } from "../lib/server-functions";

export const Route = createFileRoute("/_signed_in")({
    server: {
        middleware: [authMiddleware],
    },
    beforeLoad: async () => {
        // Fetch session data and add to context
        const session = await getSession();
        return { session };
    },
    component: SignedInLayout,
});

function SignedInLayout() {
    return <Outlet />;
}
