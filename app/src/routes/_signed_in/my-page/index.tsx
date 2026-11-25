import { createFileRoute } from "@tanstack/react-router";
import { getMyClaims, getVaultBalance, getVoteStats } from "../-functions";
import { getUserInfo } from "../-functions/get-userinfo";
import { MyPageView } from "./-components/my-page-view";
import { getPlayerPresence } from "./-functions/get-player-presence";
import type { MyPageData } from "./-types/my-page";

export const Route = createFileRoute("/_signed_in/my-page/")({
    loader: async ({ context }): Promise<MyPageData> => {
        // UUID は userinfo の sub から取る。失敗したらセッションの名前で代用する
        const userInfoPromise = getUserInfo().catch(() => null);
        // オンライン状況は UUID が分かりしだい、ほかの取得と並行して調べる
        const presencePromise = userInfoPromise.then((userInfo) =>
            userInfo?.sub
                ? getPlayerPresence({ data: { playerId: userInfo.sub } }).catch(
                      () => null,
                  )
                : null,
        );
        const [userInfo, presence, balance, claims, voteStats] =
            await Promise.all([
                userInfoPromise,
                presencePromise,
                getVaultBalance().catch(() => null),
                getMyClaims().catch(() => null),
                // getVoteStats は失敗すると null を返す
                getVoteStats(),
            ]);
        const name =
            userInfo?.preferred_username ?? context.session?.user.name ?? "";
        return {
            player: { id: userInfo?.sub ?? name, name },
            presence,
            stats: {
                balance,
                claimBlocks: claims?.remainingClaimBlocks ?? null,
                voteStreak: voteStats?.dayVoteStreak ?? null,
            },
        };
    },
    component: MyPage,
});

function MyPage() {
    const data = Route.useLoaderData();
    return <MyPageView {...data} />;
}
