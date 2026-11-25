import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { css } from "../../styled-system/css";
import { resolveActiveTab, TabBar } from "../components/tab-bar";
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

const layoutStyle = css({
    minHeight: "100vh",
    // 浮いている TabBar (高さ 64px + 下端からの余白) に本文が隠れないようにする
    paddingBottom: "calc(120px + env(safe-area-inset-bottom))",
    // 地図のように画面いっぱいに敷くページでは余白を持たず、スクロールさせない
    "&[data-full-bleed]": {
        paddingBottom: "0",
    },
    // タブバーを出さない下層ページは、本文の下に余白を足さない
    "&[data-sub-page]": {
        paddingBottom: "0",
    },
});

// タブバーを出さず、戻るボタンの上部バーで移動する下層ページ
const SUB_PAGE_PREFIXES = ["/wallet/", "/balance-claim"];

/** 下層ページ (タブバーを出さないページ) か */
const isSubPage = (pathname: string): boolean =>
    SUB_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

function SignedInLayout() {
    const { pathname } = useLocation();
    // /map は地図を画面いっぱいに敷くため、本文用の余白を外す
    const isFullBleed = resolveActiveTab(pathname) === "map";
    const subPage = isSubPage(pathname);
    return (
        <div
            className={layoutStyle}
            data-full-bleed={isFullBleed ? "" : undefined}
            data-sub-page={subPage ? "" : undefined}
        >
            <Outlet />
            {!subPage && <TabBar />}
        </div>
    );
}
