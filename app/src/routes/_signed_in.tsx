import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { css } from "../../styled-system/css";
import { resolveParty } from "../components/home-header";
import { resolveActiveTab, TabBar } from "../components/tab-bar";
import { authMiddleware } from "../lib/auth-middleware";
import {
    getSession,
    type SessionData,
    type SessionResult,
} from "../lib/server-functions";
import { redirectToUnavailable } from "../lib/unavailable-redirect";

export const Route = createFileRoute("/_signed_in")({
    server: {
        middleware: [authMiddleware],
    },
    beforeLoad: async ({ location }) => {
        const result = await getSessionForNavigation();
        // MineAuth に届かずセッションを確かめられないときは、サインインへ回さず案内ページへ送る
        if (result.authServerUnavailable) {
            throw redirectToUnavailable(location.href);
        }
        return { session: result.session };
    },
    component: SignedInLayout,
});

// ブラウザで画面を移るたびにセッションをサーバーへ聞き直すと、その往復が終わるまで
// 次のページ (スケルトンを含む) が出ない。表示に使うセッションはブラウザで少しのあいだ覚えておく。
// 各サーバー関数の認可は authMiddleware / アクセストークンでそれぞれ確かめるので、ここを使い回しても権限は広がらない
const CLIENT_SESSION_TTL_MS = 5 * 60 * 1000;
let clientSession:
    | { value: NonNullable<SessionData>; fetchedAt: number }
    | undefined;

/** 画面の移動で使うセッション。サーバーでは毎回、ブラウザでは覚えている間はそれを返す */
async function getSessionForNavigation(): Promise<SessionResult> {
    if (typeof window === "undefined") {
        return getSession();
    }
    const now = Date.now();
    if (
        clientSession &&
        now - clientSession.fetchedAt < CLIENT_SESSION_TTL_MS
    ) {
        return { session: clientSession.value, authServerUnavailable: false };
    }
    const result = await getSession();
    // サインアウトしている (null) ときや確かめられなかったときは覚えない。サインアウトの操作はページを読み込み直すので、この値も消える
    clientSession = result.session
        ? { value: result.session, fetchedAt: now }
        : undefined;
    return result;
}

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
    // つりのパーティのページ (/fishing) は、タブバーを含めて中身をうみの配色にする
    "&[data-party=tsuri]": {
        colorPalette: "umi",
        bg: "colorPalette.bg",
    },
});

// タブバーを出さず、戻るボタンの上部バーで移動する下層ページ
const SUB_PAGE_PREFIXES = [
    "/wallet/",
    "/balance-claim",
    "/diary",
    "/my-page/stamps",
    "/my-page/claims",
    "/my-page/shops",
    "/my-page/tickets",
];

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
            data-party={resolveParty(pathname)}
        >
            <Outlet />
            {!subPage && <TabBar />}
        </div>
    );
}
