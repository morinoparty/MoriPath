import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { OwnerNameProvider } from "./-components/owner-name";
import { ShopView } from "./-components/shop-view";
import { shopSearchSchema } from "./-functions/shop-search";
import { shopsQueryOptions } from "./-functions/shops-query";
import type { ShopFilter } from "./-types/shop";

export const Route = createFileRoute("/_signed_in/shop/")({
    validateSearch: shopSearchSchema,
    // 全件そろうまで数秒かかることがあるため、loader では待たずに画面 (スケルトン) をすぐ出す。
    // ブラウザでは取得だけ先に始め、リンクに触れたときの先読みでも取り始める。
    // サーバーでは取らず、スケルトンのまま返してブラウザで取る
    loader: ({ context }) => {
        if (typeof document !== "undefined") {
            void context.queryClient.prefetchQuery(shopsQueryOptions);
        }
    },
    component: ShopPage,
});

/** 検索語とチップを URL に書き込む関数。履歴を積まずに置き換え、既定値は URL に残さない */
const useShopSearchHandlers = () => {
    const navigate = Route.useNavigate();
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
    return { changeQuery, changeFilter };
};

function ShopPage() {
    const { q, mode } = Route.useSearch();
    const { session } = Route.useRouteContext();
    // 一度そろえた一覧はキャッシュからすぐ出る。無ければそろうまでスケルトンを出す
    const { data, isPending } = useQuery(shopsQueryOptions);
    const { changeQuery, changeFilter } = useShopSearchHandlers();

    return (
        // 持ち主の名前は、表示した行の分だけブラウザで引く
        <OwnerNameProvider>
            <ShopView
                session={session}
                // 取得に失敗したときは null (一覧の場所で知らせる)
                shops={data ?? null}
                loading={isPending}
                query={q ?? ""}
                filter={mode ?? "all"}
                onQueryChange={changeQuery}
                onFilterChange={changeFilter}
            />
        </OwnerNameProvider>
    );
}
