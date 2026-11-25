import { createFileRoute } from "@tanstack/react-router";
import { css } from "../../../../styled-system/css";
import { HomeHeader } from "../../../components/home-header";

export const Route = createFileRoute("/_signed_in/fishing/")({
    component: FishingPage,
});

// ホームと同じく、ノッチ付き端末ではステータスバーの下から始める
const pageStyle = css({
    display: "flex",
    flexDirection: "column",
    paddingTop: "max(token(spacing.2), env(safe-area-inset-top))",
});

/**
 * つりのパーティのトップ。中身はまだ無く、ヘッダーだけ置いておく。
 * 配色 (うみ) は _signed_in のレイアウトが URL を見て切り替える
 */
function FishingPage() {
    const { session } = Route.useRouteContext();
    return (
        <main className={pageStyle}>
            <h1 className={css({ srOnly: true })}>つりのパーティ</h1>
            <HomeHeader.Builted session={session} />
        </main>
    );
}
