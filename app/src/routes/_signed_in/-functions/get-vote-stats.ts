import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "../../../lib/auth";
import type { VoteStats } from "../-types/vote-stats";
import { fetchVoteStats } from "./fetch-vote-stats";

/** 自分の投票状況を取得する。取得できなければ null (画面側で非表示にする) */
export const getVoteStats = createServerFn().handler(
    // oxlint-disable-next-line typescript/no-explicit-any -- request is not typed
    async ({ request }: any): Promise<VoteStats | null> => {
        try {
            const auth = await getAuth();
            const tokenResult = await auth.api.getAccessToken({
                body: { useAccountCookie: true },
                headers: request.headers,
            });

            if (!tokenResult?.accessToken) {
                return null;
            }

            return await fetchVoteStats(tokenResult.accessToken);
        } catch (error) {
            console.warn("投票状況を取得できません:", error);
            return null;
        }
    },
);

export type VoteStatsData = Awaited<ReturnType<typeof getVoteStats>>;
