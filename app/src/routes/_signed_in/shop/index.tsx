import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { ShopView } from "./-components/shop-view";
import { shopSearchSchema } from "./-functions/shop-search";
import { shopsQueryOptions } from "./-functions/shops-query";
import type { ShopFilter } from "./-types/shop";

export const Route = createFileRoute("/_signed_in/shop/")({
    validateSearch: shopSearchSchema,
    // お店の一覧は SSR で先に取り、画面では同じクエリを読む (失敗しても null で画面は出す)
    loader: ({ context }) =>
        context.queryClient.ensureQueryData(shopsQueryOptions),
    component: ShopPage,
});

function ShopPage() {
    const { q, mode } = Route.useSearch();
    const { session } = Route.useRouteContext();
    const navigate = Route.useNavigate();
    const { data: shops = null } = useQuery(shopsQueryOptions);

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
        <ShopView
            session={session}
            shops={shops}
            query={q ?? ""}
            filter={mode ?? "all"}
            onQueryChange={changeQuery}
            onFilterChange={changeFilter}
        />
    );
}
