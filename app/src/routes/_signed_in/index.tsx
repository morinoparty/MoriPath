import { createFileRoute } from "@tanstack/react-router";
import { HomeView } from "./-components/home-view";
import {
    getDiaryEntries,
    getMyClaims,
    getVaultBalance,
    getVoteStats,
} from "./-functions";
import { getUserInfo } from "./-functions/get-userinfo";

export const Route = createFileRoute("/_signed_in/")({
    loader: async () => {
        // どれか 1 つが失敗してもホームは出せるよう、それぞれ取得できない時の値に落とす
        const [balance, claims, voteStats, diaryEntries, userInfo] =
            await Promise.all([
                getVaultBalance().catch(() => null),
                getMyClaims().catch(() => null),
                // getVoteStats は失敗時に null を返すため catch 不要
                getVoteStats(),
                getDiaryEntries().catch(() => []),
                getUserInfo().catch(() => null),
            ]);
        return { balance, claims, voteStats, diaryEntries, userInfo };
    },
    component: Home,
});

function Home() {
    const { balance, claims, voteStats, diaryEntries, userInfo } =
        Route.useLoaderData();
    const { session } = Route.useRouteContext();

    return (
        <HomeView
            session={session}
            player={{
                // Better Auth のユーザー ID は UUID ではないため、MineAuth の userinfo の sub を使う
                id: userInfo?.sub ?? null,
                name: userInfo?.preferred_username ?? session?.user?.name ?? "",
            }}
            balance={balance}
            claimBlocks={claims?.remainingClaimBlocks ?? null}
            voteStreak={voteStats?.dayVoteStreak ?? null}
            diaryEntries={diaryEntries}
        />
    );
}
