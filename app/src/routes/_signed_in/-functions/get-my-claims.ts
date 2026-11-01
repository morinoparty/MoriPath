import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "../../../lib/auth";
import { getServerUrl } from "../../../lib/server-list";

interface ClaimsMeResponse {
    accruedClaimBlocks: number;
    bonusClaimBlocks: number;
    claims: Array<{
        area: number;
        claimId: number;
        greaterCorner: { world: string; x: number; y: number; z: number };
        lesserCorner: { world: string; x: number; y: number; z: number };
        owner: string | null;
        world: string;
    }>;
    remainingClaimBlocks: number;
    totalClaimCount: number;
}

export const getMyClaims = createServerFn().handler(
    // biome-ignore lint/suspicious/noExplicitAny: request is not typed
    async ({ request }: any) => {
        const auth = await getAuth();
        const tokenResult = await auth.api.getAccessToken({
            body: { useAccountCookie: true },
            headers: request.headers,
        });

        if (!tokenResult?.accessToken) {
            throw new Error("No access token available");
        }

        // GriefPrevention / Vault は main サーバーにのみ存在する
        const mainServerUrl = getServerUrl("main");

        const response = await fetch(
            `${mainServerUrl}/api/v1/plugins/griefprevention/claims/me`,
            {
                headers: {
                    Authorization: `Bearer ${tokenResult.accessToken}`,
                },
            },
        );

        if (!response.ok) {
            throw new Error("Failed to fetch my claims");
        }

        const data = (await response.json()) as ClaimsMeResponse;
        return {
            remainingClaimBlocks: data.remainingClaimBlocks,
            accruedClaimBlocks: data.accruedClaimBlocks,
            bonusClaimBlocks: data.bonusClaimBlocks,
            totalClaimCount: data.totalClaimCount,
        };
    },
);

export type MyClaimsData = Awaited<ReturnType<typeof getMyClaims>>;
