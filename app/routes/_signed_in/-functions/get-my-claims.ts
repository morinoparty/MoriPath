import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { auth } from "../../../lib/auth";

/** GriefPrevention API の claims/me レスポンス型（OpenAPI 準拠） */
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

/**
 * MineAuth GriefPrevention API で「自分のクレーム情報」を取得する。
 * remainingClaimBlocks が残り保護ブロック数（remainingClaimAmount）として使える。
 */
export const getMyClaims = createServerFn().handler(
    // biome-ignore lint/suspicious/noExplicitAny: request is not typed
    async ({ request }: any) => {
        const tokenResult = await auth.api.getAccessToken({
            body: {
                providerId: "MineAuth",
            },
            headers: request.headers,
        });

        if (!tokenResult?.accessToken) {
            throw new Error("No access token available");
        }

        const response = await fetch(
            `${env.MAIN_SERVER_URL}/api/v1/plugins/mineauth-addon-griefprevention/claims/me`,
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
