import { findMapPlayer, isWorldId } from "../../-functions/find-map-player";
import { useMapPlayers } from "../../-functions/use-map-players";
import type { SelfPosition } from "../-types/transit";

/** ログイン中のプレイヤーが squaremap に出ていればその位置。出ていない・取れない・無効なら null */
export const useSelfPosition = (
    worldMapUrl: string | null,
    selfName: string | null,
    enabled: boolean,
): SelfPosition | null => {
    // /map と同じ、数秒おきに取り直すプレイヤー位置のクエリを使う
    const { data } = useMapPlayers(
        worldMapUrl ?? "",
        enabled && worldMapUrl !== null && selfName !== null,
    );
    if (!enabled || data === undefined || selfName === null) return null;
    const player = findMapPlayer(data.players, selfName);
    if (player === null || !isWorldId(player.world)) return null;
    return { world: player.world, x: player.x, z: player.z };
};
