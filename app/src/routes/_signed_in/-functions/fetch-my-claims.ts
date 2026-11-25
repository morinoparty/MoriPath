import { z } from "zod";
import { getMineAuthAccessToken } from "../../../lib/auth";
import { MINEAUTH_API_TIMEOUT_MS } from "../../../lib/mineauth-timeout";
import { getServerUrl } from "../../../lib/server-list";

// サーバー関数の中からだけ呼ぶ。クライアントに auth を持ち込まないよう、サーバー関数とは別のファイルに置く

// 保護範囲の角。GriefPrevention のブロック座標 (両端を含む)
const claimCornerSchema = z.object({
    world: z.string(),
    x: z.number(),
    y: z.number(),
    z: z.number(),
});

/** 保護範囲 1 件 */
const claimSchema = z.object({
    area: z.number(),
    claimId: z.number(),
    greaterCorner: claimCornerSchema,
    lesserCorner: claimCornerSchema,
    owner: z.string().nullish(),
    world: z.string(),
});

/**
 * GET /api/v1/plugins/griefprevention/claims/{player} の応答。
 * 保護範囲は 1 件ずつ読み、形の違う 1 件のせいで保護ブロックの数まで出せなくならないようにする
 */
const claimsResponseSchema = z.object({
    accruedClaimBlocks: z.number(),
    bonusClaimBlocks: z.number(),
    claims: z.array(z.unknown()).transform((claims) =>
        claims.flatMap((claim) => {
            const parsed = claimSchema.safeParse(claim);
            if (!parsed.success) {
                console.warn("保護範囲を読めないため省きます:", parsed.error);
                return [];
            }
            return [parsed.data];
        }),
    ),
    remainingClaimBlocks: z.number(),
    totalClaimCount: z.number(),
});

export type ClaimsResponse = z.output<typeof claimsResponseSchema>;

/** ログイン中のプレイヤーの保護範囲と保護ブロックを MineAuth から取る */
export async function fetchMyClaims(headers: Headers): Promise<ClaimsResponse> {
    const tokenResult = await getMineAuthAccessToken(headers);

    if (!tokenResult?.accessToken) {
        throw new Error("No access token available");
    }

    return fetchMyClaimsWithToken(tokenResult.accessToken);
}

/** 取得済みのアクセストークンで、保護範囲と保護ブロックを MineAuth から取る */
export async function fetchMyClaimsWithToken(
    accessToken: string,
): Promise<ClaimsResponse> {
    // GriefPrevention / Vault は main サーバーにのみ存在する
    const mainServerUrl = getServerUrl("main");

    const response = await fetch(
        `${mainServerUrl}/api/v1/plugins/griefprevention/claims/me`,
        {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: AbortSignal.timeout(MINEAUTH_API_TIMEOUT_MS),
        },
    );

    if (!response.ok) {
        throw new Error("Failed to fetch my claims");
    }

    return claimsResponseSchema.parse(await response.json());
}
