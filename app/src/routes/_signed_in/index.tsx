import { createFileRoute } from "@tanstack/react-router";
import { HomeView } from "./-components/home-view";
import {
    getDiaryEntries,
    getMyClaims,
    getOnlinePlayers,
    getVaultBalance,
    getVoteStats,
} from "./-functions";
import { getUserInfo } from "./-functions/get-userinfo";
import { useOnlinePlayers } from "./-functions/use-online-players";

export const Route = createFileRoute("/_signed_in/")({
    loader: async () => {
        // どれか 1 つが失敗してもホームは出せるよう、それぞれ取得できない時の値に落とす
        const [
            balance,
            claims,
            voteStats,
            diaryEntries,
            userInfo,
            onlinePlayers,
        ] = await Promise.all([
            getVaultBalance().catch(() => null),
            getMyClaims().catch(() => null),
            // getVoteStats は失敗時に null を返すため catch 不要
            getVoteStats(),
            getDiaryEntries().catch(() => null),
            getUserInfo().catch(() => null),
            getOnlinePlayers().catch(() => null),
        ]);
        return {
            balance,
            claims,
            voteStats,
            diaryEntries,
            userInfo,
            onlinePlayers,
        };
    },
    component: Home,
});

function Home() {
    const {
        balance,
        claims,
        voteStats,
        diaryEntries,
        userInfo,
        onlinePlayers,
    } = Route.useLoaderData();
    const { session } = Route.useRouteContext();
    // loader の値を初期値に、ホームを開いているあいだはオンライン一覧を取り直し続ける
    const { data: latestOnlinePlayers } = useOnlinePlayers(onlinePlayers);

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
            onlinePlayers={
                // サーバーの username を一覧の表示名 (name) にそろえる
                latestOnlinePlayers?.map((player) => ({
                    id: player.id,
                    name: player.username,
                    server: player.server,
                })) ?? null
            }
        />
    );
}
