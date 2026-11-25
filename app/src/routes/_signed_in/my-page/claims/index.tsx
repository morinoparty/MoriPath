import { createFileRoute } from "@tanstack/react-router";
import { MyClaimsView } from "./-components/my-claims-view";
import { getMyClaimList } from "./-functions/get-my-claim-list";

export const Route = createFileRoute("/_signed_in/my-page/claims/")({
    // 取れなくても画面は出し、読み込めなかった旨を一覧の場所に出す
    loader: async () => ({
        data: await getMyClaimList().catch(() => null),
    }),
    component: MyClaimsPage,
});

function MyClaimsPage() {
    const { data } = Route.useLoaderData();
    return <MyClaimsView data={data} />;
}
