import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { OwnerNameProvider } from "./-components/owner-name";
import { ShopView } from "./-components/shop-view";
import { getInitialShops, type InitialShops } from "./-functions/get-shops";
import { shopSearchSchema } from "./-functions/shop-search";
import { shopsQueryOptions } from "./-functions/shops-query";
import type { ShopFilter } from "./-types/shop";

export const Route = createFileRoute("/_signed_in/shop/")({
    validateSearch: shopSearchSchema,
    // 全ページを待つと遅いため、loader はキャッシュ済みの一覧か 1 ページ目だけを待つ
    loader: async ({ context }): Promise<InitialShops | null> => {
        // 一度すべて読んだあとの再訪では、手元の一覧で出してサーバーに聞かない
        const cached = context.queryClient.getQueryState(
            shopsQueryOptions.queryKey,
        );
        if (cached?.data) {
            return {
                shops: cached.data,
                complete: true,
                fetchedAt: cached.dataUpdatedAt,
            };
        }
        // 取れなくても画面は出し、残りのクエリで取り直させる
        return getInitialShops().catch((error: unknown) => {
            console.warn("お店の一覧の 1 ページ目を取得できません:", error);
            return null;
        });
    },
    component: ShopPage,
});

function ShopPage() {
    const { q, mode } = Route.useSearch();
    const { session } = Route.useRouteContext();
    const navigate = Route.useNavigate();
    const initial = Route.useLoaderData();
    const isComplete = initial?.complete ?? false;
    // すべてそろっていれば初期値に、1 ページ目だけなら残りが届くまでの仮の値にする。
    // 仮の値のあいだはクエリがすぐに全件を取りに行く
    const { data, isPlaceholderData, isPending } = useQuery({
        ...shopsQueryOptions,
        initialData: isComplete ? initial?.shops : undefined,
        initialDataUpdatedAt: initial?.fetchedAt,
        placeholderData: isComplete ? undefined : initial?.shops,
    });
    // 仮の値のあいだは data が 1 ページ目になる。全件の取得に失敗 (null) したときも 1 ページ目を残す
    const shops = data ?? initial?.shops ?? null;

    // 検索語とチップは URL に持ち、履歴を積まずに置き換える。既定値は URL に残さない
    const changeQuery = useCallback(
        (query: string) => {
            void navigate({
                search: (prev) => ({ ...prev, q: query.trim() || undefined }),
                replace: true,
            });
        },
        [navigate],
    );
    const changeFilter = (filter: ShopFilter) => {
        void navigate({
            search: (prev) => ({
                ...prev,
                mode: filter === "all" ? undefined : filter,
            }),
            replace: true,
        });
    };

    return (
        // 持ち主の名前は、表示した行の分だけブラウザで引く
        <OwnerNameProvider>
            <ShopView
                session={session}
                shops={shops}
                loadingMore={isPlaceholderData || isPending}
                query={q ?? ""}
                filter={mode ?? "all"}
                onQueryChange={changeQuery}
                onFilterChange={changeFilter}
            />
        </OwnerNameProvider>
    );
}
