import { createFileRoute, useRouter } from "@tanstack/react-router";
import { MyPageError } from "./-components/my-page-error";
import { MyPageView } from "./-components/my-page-view";
import { getMyPageData } from "./-functions/get-my-page-data";
import { useStatsHidden } from "./-functions/use-stats-hidden";
import type { MyPageData } from "./-types/my-page";

export const Route = createFileRoute("/_signed_in/my-page/")({
    // getMyPageData はトークンを 1 回だけ取り、数値・スタンプ帳・オンライン状況をそろえてから返す (最初から完成した形で出す)
    loader: async ({ context }): Promise<MyPageData> => {
        const { playerId, presence, stats, stamps, statsHidden } =
            await getMyPageData();
        // MineAuth の name / preferred_username はどちらも MCID で、サインイン時にセッションへ入る
        const name = context.session?.user.name ?? "";
        return {
            // UUID が分からなければ MCID でスキンとアバターを引く
            player: { id: playerId ?? name, name },
            presence,
            stats,
            stamps,
            statsHidden,
        };
    },
    component: MyPage,
    // 既定の "Something went wrong!" の代わりに、再読み込みできる案内を出す
    errorComponent: MyPageErrorBoundary,
});

function MyPage() {
    const data = Route.useLoaderData();
    const [statsHidden, setStatsHidden] = useStatsHidden(data.statsHidden);
    return (
        <MyPageView
            {...data}
            statsHidden={statsHidden}
            onStatsHiddenChange={setStatsHidden}
        />
    );
}

function MyPageErrorBoundary() {
    const router = useRouter();
    // invalidate で loader を取り直し、エラー境界も元に戻す
    return <MyPageError onRetry={() => router.invalidate()} />;
}
