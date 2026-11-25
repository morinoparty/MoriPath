import { createFileRoute } from "@tanstack/react-router";
import { getMyClaims, getVaultBalance, getVoteStats } from "../-functions";
import { getUserInfo } from "../-functions/get-userinfo";
import { MyPageView } from "./-components/my-page-view";
import { getMyStamps } from "./-functions/get-my-stamps";
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
        const [userInfo, presence, balance, claims, voteStats, stamps] =
            await Promise.all([
                userInfoPromise,
                presencePromise,
                getVaultBalance().catch(() => null),
                getMyClaims().catch(() => null),
                // getVoteStats は失敗すると null を返す
                getVoteStats(),
                // 通信自体の失敗も含め、取れなければスタンプ帳を隠す
                getMyStamps().catch(() => null),
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
            stamps,
        };
    },
    component: MyPage,
});

function MyPage() {
    const data = Route.useLoaderData();
    return <MyPageView {...data} />;
}
