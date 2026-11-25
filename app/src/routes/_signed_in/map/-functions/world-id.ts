import type { WorldId } from "../-types/world-map";

// サーバー上のワールド名 → squaremap のワールド ID
const worldIdByName: Record<string, WorldId> = {
    world: "minecraft_overworld",
    world_nether: "minecraft_the_nether",
    world_the_end: "minecraft_the_end",
};

/** サーバー上のワールド名を /map のワールド ID にする。知らないワールドなら null */
export const toWorldId = (world: string): WorldId | null =>
    worldIdByName[world] ?? null;
