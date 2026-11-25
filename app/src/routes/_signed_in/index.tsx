import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { HomeView } from "./-components/home-view";
import { getHomeData } from "./-functions/get-home-data";
import { onlinePlayersQueryOptions } from "./-functions/online-players-query";

export const Route = createFileRoute("/_signed_in/")({
    // getHomeData はトークンの用意だけを待って返り、残高やダイアリーは Promise のまま届く。
    // 画面は見出しとスキンから先に出し、各セクションは届いた順にスケルトンから置き換える
    loader: ({ context }) => {
        // オンライン一覧はブラウザで取り直し続けるため Query に任せる。
        // サーバーで描いたスケルトンとハイドレーションで食い違わないよう、ブラウザでだけ先に取り始める
        if (typeof document !== "undefined") {
            void context.queryClient.prefetchQuery(onlinePlayersQueryOptions);
        }
        return getHomeData();
    },
    component: Home,
});

function Home() {
    const { playerId, balance, claimBlocks, voteStreak, diaryEntries } =
        Route.useLoaderData();
    const { session } = Route.useRouteContext();
    // 取得中は undefined (帯のスケルトン)、取れなかったときは null
    const { data: onlinePlayers } = useQuery(onlinePlayersQueryOptions);

    return (
        <HomeView
            session={session}
            player={{
                // Better Auth のユーザー ID は UUID ではないため、MineAuth のトークンの sub を使う
                id: playerId,
                // MineAuth の name / preferred_username はどちらも MCID で、サインイン時にセッションへ入る
                name: session?.user?.name ?? "",
            }}
            balance={balance}
            claimBlocks={claimBlocks}
            voteStreak={voteStreak}
            diaryEntries={diaryEntries}
            onlinePlayers={onlinePlayers}
        />
    );
}
