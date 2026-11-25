import type {
    MyClaim,
    MyClaimsPageData,
} from "@/routes/_signed_in/my-page/claims/-types/my-claim";

/** _NIKOMARU が保護している土地 (大きい順) */
export const sampleMyClaims = {
    home: {
        id: 128,
        world: "world",
        worldId: "minecraft_overworld",
        center: { x: -5180, z: -8590 },
        width: 48,
        depth: 40,
        area: 1920,
    },
    farm: {
        id: 204,
        world: "world",
        worldId: "minecraft_overworld",
        center: { x: -5260, z: -8642 },
        width: 32,
        depth: 24,
        area: 768,
    },
    netherBase: {
        id: 311,
        world: "world_nether",
        worldId: "minecraft_the_nether",
        center: { x: -640, z: -1072 },
        width: 16,
        depth: 16,
        area: 256,
    },
    // /map で開けないワールドの土地 (リンクにしない)
    resource: {
        id: 402,
        world: "resource_world",
        worldId: null,
        center: { x: 120, z: 88 },
        width: 10,
        depth: 10,
        area: 100,
    },
} satisfies Record<string, MyClaim>;

/** 保護した土地の画面のデータ */
export const sampleMyClaimsPage: MyClaimsPageData = {
    remainingClaimBlocks: 1240,
    claims: [
        sampleMyClaims.home,
        sampleMyClaims.farm,
        sampleMyClaims.netherBase,
        sampleMyClaims.resource,
    ],
};
