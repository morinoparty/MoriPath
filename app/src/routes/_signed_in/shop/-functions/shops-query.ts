import { queryOptions } from "@tanstack/react-query";
import { getShops } from "./get-shops";

/**
 * /shop のすべてのお店。そろうまでは画面にスケルトンを出し、そろったら一度に並べる。
 * 開いているあいだもゆっくり取り直す
 */
export const shopsQueryOptions = queryOptions({
    queryKey: ["shops"],
    // 取得に失敗しても画面は出せるよう null に落とす
    queryFn: () =>
        getShops().catch((error: unknown) => {
            console.warn("お店の一覧を取得できません:", error);
            return null;
        }),
    // ゲーム内でお店は増減するため、開いているあいだもゆっくり取り直す
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: false,
});
