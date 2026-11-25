import { createFileRoute, useRouter } from "@tanstack/react-router";
import { MyPageError } from "./-components/my-page-error";
import { MyPageView } from "./-components/my-page-view";
import { getMyPageData } from "./-functions/get-my-page-data";
import type { MyPageData } from "./-types/my-page";

export const Route = createFileRoute("/_signed_in/my-page/")({
    // getMyPageData はトークンとオンライン状況だけを待って返り、数値とスタンプ帳は Promise のまま届く
    loader: async ({ context }): Promise<MyPageData> => {
        const { playerId, presence, stats, stamps } = await getMyPageData();
        // MineAuth の name / preferred_username はどちらも MCID で、サインイン時にセッションへ入る
        const name = context.session?.user.name ?? "";
        return {
            // UUID が分からなければ MCID でスキンとアバターを引く
            player: { id: playerId ?? name, name },
            presence,
            stats,
            stamps,
        };
    },
    component: MyPage,
    // 既定の "Something went wrong!" の代わりに、再読み込みできる案内を出す
    errorComponent: MyPageErrorBoundary,
});

function MyPage() {
    const data = Route.useLoaderData();
    return <MyPageView {...data} />;
}

function MyPageErrorBoundary() {
    const router = useRouter();
    // invalidate で loader を取り直し、エラー境界も元に戻す
    return <MyPageError onRetry={() => router.invalidate()} />;
}
