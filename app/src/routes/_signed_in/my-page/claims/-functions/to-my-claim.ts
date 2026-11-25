import type { ClaimsResponse } from "../../../-functions/fetch-my-claims";
import { toWorldId } from "../../../map/-functions/world-id";
import type { MyClaim } from "../-types/my-claim";

type ApiClaim = ClaimsResponse["claims"][number];

/** API の保護範囲を画面用の形にする */
export const toMyClaim = (claim: ApiClaim): MyClaim => {
    const { lesserCorner: lesser, greaterCorner: greater } = claim;
    // GriefPrevention の角は両端のブロックを含むため、差に 1 を足す
    const width = greater.x - lesser.x + 1;
    const depth = greater.z - lesser.z + 1;
    return {
        id: claim.claimId,
        world: claim.world,
        worldId: toWorldId(claim.world),
        // /map の座標は整数で受け取るため、中心を切り捨てる
        center: {
            x: Math.floor((lesser.x + greater.x) / 2),
            z: Math.floor((lesser.z + greater.z) / 2),
        },
        width,
        depth,
        // 面積は GriefPrevention が数えた値 (幅 × 奥行き) をそのまま使う
        area: claim.area,
    };
};

/** 大きい土地を先に、同じ広さなら古い順に並べる */
export const sortMyClaims = (claims: readonly MyClaim[]): MyClaim[] =>
    [...claims].sort((a, b) => b.area - a.area || a.id - b.id);
