import { createServerFn } from "@tanstack/react-start";
import { fetchMyClaims } from "../../../-functions/fetch-my-claims";
import type { MyClaimsPageData } from "../-types/my-claim";
import { sortMyClaims, toMyClaim } from "./to-my-claim";

/** ログイン中のプレイヤーの保護ブロックと、保護している土地の一覧 */
export const getMyClaimList = createServerFn().handler(
    // oxlint-disable-next-line typescript/no-explicit-any -- request is not typed
    async ({ request }: any): Promise<MyClaimsPageData> => {
        const data = await fetchMyClaims(request.headers);
        return {
            remainingClaimBlocks: data.remainingClaimBlocks,
            claims: sortMyClaims(data.claims.map(toMyClaim)),
        };
    },
);
