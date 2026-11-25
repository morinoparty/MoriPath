import { createServerFn } from "@tanstack/react-start";
import { fetchMyClaims } from "./fetch-my-claims";

/** 保護ブロックの数だけを返す (ホーム・マイページ・購入画面では保護範囲の一覧を送らない) */
export const getMyClaims = createServerFn().handler(
    // oxlint-disable-next-line typescript/no-explicit-any -- request is not typed
    async ({ request }: any) => {
        const data = await fetchMyClaims(request.headers);
        return {
            remainingClaimBlocks: data.remainingClaimBlocks,
            accruedClaimBlocks: data.accruedClaimBlocks,
            bonusClaimBlocks: data.bonusClaimBlocks,
            totalClaimCount: data.totalClaimCount,
        };
    },
);

export type MyClaimsData = Awaited<ReturnType<typeof getMyClaims>>;
