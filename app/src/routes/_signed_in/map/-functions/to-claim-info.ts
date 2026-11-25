import type { CompactClaim } from "../-types/compact-markers";
import type { ClaimInfo } from "../-types/world-map";

/** 名前の番号の並びを名前にする */
const resolveNames = (names: string[], indexes: number[] | undefined) =>
    (indexes ?? []).map((index) => names[index] ?? "");

/** 詰めた保護範囲 1 件を、ポップアップに出す形に戻す (タップされたときだけ呼ぶ) */
export const toClaimInfo = (
    names: string[],
    claim: CompactClaim,
): ClaimInfo => {
    const [
        ,
        ,
        ,
        ,
        owner,
        isAdmin,
        permissionTrust,
        trust,
        containerTrust,
        accessTrust,
    ] = claim;
    return {
        isAdmin: isAdmin === 1,
        owner: names[owner] ?? "",
        permissionTrust: resolveNames(names, permissionTrust),
        trust: resolveNames(names, trust),
        containerTrust: resolveNames(names, containerTrust),
        accessTrust: resolveNames(names, accessTrust),
    };
};
