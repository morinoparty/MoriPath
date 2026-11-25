import { type MapPlayer, type WorldId, worldIds } from "../-types/world-map";
import { normalizeUuid } from "./world-map-coords";

/** squaremap のワールド名が /map で開けるワールドか */
export const isWorldId = (world: string): world is WorldId =>
    (worldIds as readonly string[]).includes(world);

/**
 * URL の player (名前か UUID) に当たるプレイヤーを探す。
 * UUID はハイフンの有無、名前は大文字・小文字の違いを無視する
 */
export const findMapPlayer = (
    players: readonly MapPlayer[],
    key: string,
): MapPlayer | null => {
    const uuid = normalizeUuid(key);
    const name = key.toLowerCase();
    return (
        players.find(
            (player) =>
                normalizeUuid(player.uuid) === uuid ||
                player.name.toLowerCase() === name,
        ) ?? null
    );
};
