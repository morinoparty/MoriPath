import { createFileRoute, useRouter } from "@tanstack/react-router";
import { TransitNotice } from "./-components/transit-notice";
import { TransitNoticePage } from "./-components/transit-notice-page";
import { TransitView } from "./-components/transit-view";
import { loadTransitRoute } from "./-functions/load-transit-route";
import {
    transitNetworkQueryOptions,
    transitWorldMapUrlQueryOptions,
} from "./-functions/transit-network-query";
import {
    changeMode,
    changeQuery,
    editSlot,
    modeOf,
    openLine,
    swapStations,
    type TransitSearch,
    transitSearchSchema,
} from "./-functions/transit-search";
import { useRecentStations } from "./-functions/use-recent-stations";
import { useSelfPosition } from "./-functions/use-self-position";

export const Route = createFileRoute("/_signed_in/map/transit/")({
    validateSearch: transitSearchSchema,
    // 経路は出発・到着だけで決まる。モード・路線・検索語・枠が変わっても loader は呼び直さない
    loaderDeps: ({ search }) => ({ from: search.from, to: search.to }),
    loader: async ({ context, deps }) => {
        const [network, worldMapUrl] = await Promise.all([
            // 駅と路線はページのデータ。出発・到着が変わって loader が呼び直されても取り直さないよう、クエリのキャッシュに覚えておく
            context.queryClient.ensureQueryData(transitNetworkQueryOptions),
            // 現在地から近い駅と、街の駅でない駅の見出しの地図に使う。取れなくてもページは出す (失敗はキャッシュされず、次の loader で聞き直す)
            context.queryClient
                .ensureQueryData(transitWorldMapUrlQueryOptions)
                .catch(() => null),
        ]);
        // 使えなかった (null) 結果は覚えておかず、次に開いたときや再試行で API に聞き直す
        if (network === null) {
            context.queryClient.removeQueries({
                queryKey: transitNetworkQueryOptions.queryKey,
            });
        }
        // 経路は待たずに Promise のまま渡す。URL の状態 (枠・駅) はすぐに切り替え、経路の欄だけ読み込み中を出す
        // (loadTransitRoute は失敗しても reject せず、状態として返す)
        const route = loadTransitRoute(network, deps.from, deps.to);
        return { network, worldMapUrl, route };
    },
    // 駅や経路はめったに変わらないので、同じ出発・到着では取り直さない (再試行は router.invalidate)
    staleTime: Number.POSITIVE_INFINITY,
    errorComponent: TransitErrorBoundary,
    component: TransitPage,
});

/** 駅の一覧を読み込めなかったとき。見出しは残し、もう一度読み込めるようにする */
function TransitErrorBoundary() {
    const router = useRouter();
    return (
        <TransitNoticePage>
            <TransitNotice
                kind="networkError"
                onRetry={() => router.invalidate()}
            />
        </TransitNoticePage>
    );
}

function TransitPage() {
    const { network, worldMapUrl, route } = Route.useLoaderData();
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    const router = useRouter();
    const { session } = Route.useRouteContext();
    const [recentSlugs, pushRecent] = useRecentStations();
    // 自分の位置は「駅名でさがす」の入力前 (近い駅を出す場面) だけ取る
    const selfPosition = useSelfPosition(
        worldMapUrl,
        session?.user.name ?? null,
        modeOf(search) === "search" && !search.q,
    );
    // 状態はすべて URL に置く。戻るボタンで 1 手ずつ戻れるよう、検索語以外は履歴に積む
    const go = (next: TransitSearch, replace = false) => {
        void navigate({ search: next, replace });
    };

    return (
        <TransitView
            network={network}
            worldMapUrl={worldMapUrl}
            route={route}
            search={search}
            recentSlugs={recentSlugs}
            selfPosition={selfPosition}
            onEditSlot={(slot) => go(editSlot(search, slot))}
            onSwap={() => go(swapStations(search))}
            onModeChange={(mode) => go(changeMode(search, mode))}
            onLineChange={(line) => go(openLine(search, line))}
            // 1 文字ごとに履歴を積まないよう、検索語は置きかえる
            onQueryChange={(q) => go(changeQuery(search, q), true)}
            onConfirmStation={(next, slug) => {
                pushRecent(slug);
                go(next);
            }}
            onRetryRoute={() => void router.invalidate()}
        />
    );
}
