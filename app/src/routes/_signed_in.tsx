import { createFileRoute, Outlet } from "@tanstack/react-router";
import { css } from "../../styled-system/css";
import { TabBar } from "../components/tab-bar";
import { authMiddleware } from "../lib/auth-middleware";
import { getSession } from "../lib/server-functions";

export const Route = createFileRoute("/_signed_in")({
    server: {
        middleware: [authMiddleware],
    },
    beforeLoad: async () => {
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
                // 浮いている TabBar (高さ 64px + 下端からの余白) に本文が隠れないようにする
                paddingBottom: "calc(120px + env(safe-area-inset-bottom))",
            })}
        >
            <Outlet />
            <TabBar />
        </div>
    );
}
