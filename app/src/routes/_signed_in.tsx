import { createFileRoute, Outlet } from "@tanstack/react-router";
import { css } from "../../styled-system/css";
import { Navbar } from "../components/navbar";
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
    return (
        <div
            className={css({
                minHeight: "100vh",
                paddingBottom: "100px",
            })}
        >
            <Outlet />
            <Navbar />
        </div>
    );
}
