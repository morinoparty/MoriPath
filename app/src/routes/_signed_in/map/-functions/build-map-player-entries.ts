import { getServerLabel } from "../../../../lib/server-labels";
import type { OnlinePlayer } from "../../-types/online-player";
import type {
    MapPlayerEntry,
    MapPlayerEntryGroup,
} from "../-types/map-player-entry";
import { type MapPlayer, type WorldId, worldIds } from "../-types/world-map";
import { isWorldId } from "./find-map-player";
import { worldLabels } from "./world-labels";
import { normalizeUuid } from "./world-map-coords";

// squaremap (seikatsumain.map) が描いているサーバーの ID。ここにいるのに地図に無い人は、地図から隠れている
const MAP_SERVER_ID = "main";

/** 名前の順 (大文字・小文字を区別しない) に並べる */
const byName = (a: { name: string }, b: { name: string }) =>
    a.name.localeCompare(b.name, "ja", { sensitivity: "base" });

/** 地図に出ていない人の理由。地図のサーバーなら隠れている、ほかのサーバーならそのサーバー名を出す */
const offMapReason = (server: string): string =>
    server === MAP_SERVER_ID
        ? "地図に表示されていません"
        : `${getServerLabel(server)}にいます`;

/**
 * 「プレイヤー」一覧の見出しと並びを作る。
 * 表示中のワールド → ほかのワールド → 地図で追えない人の順にし、誰もいない見出しは出さない
 *
 * @param mapPlayers squaremap の players.json に載っている人 (地図で位置が分かる人)
 * @param onlinePlayers ネットワーク全体のオンライン一覧。取れていなければ null (地図の人だけを出す)
 * @param currentWorld いま表示しているワールド
 */
export const buildMapPlayerEntries = (
    mapPlayers: readonly MapPlayer[],
    onlinePlayers: readonly OnlinePlayer[] | null,
    currentWorld: WorldId,
): MapPlayerEntryGroup[] => {
    const byWorld = new Map<WorldId, MapPlayerEntry[]>();
    const offMap: MapPlayerEntry[] = [];
    // 地図に載っている人を UUID と名前で覚え、オンライン一覧と重ならないようにする
    const seenUuids = new Set<string>();
    const seenNames = new Set<string>();

    for (const player of mapPlayers) {
        seenUuids.add(normalizeUuid(player.uuid));
        seenNames.add(player.name.toLowerCase());
        if (!isWorldId(player.world)) {
            // /map で開けないワールドにいる人は追えない
            offMap.push({
                status: "offMap",
                id: player.uuid,
                name: player.name,
                reason: "地図に無いワールドにいます",
            });
            continue;
        }
        const entries = byWorld.get(player.world) ?? [];
        entries.push({
            status: "onMap",
            id: player.uuid,
            name: player.name,
            world: player.world,
        });
        byWorld.set(player.world, entries);
    }

    for (const player of onlinePlayers ?? []) {
        const isOnMap =
            seenUuids.has(normalizeUuid(player.id)) ||
            seenNames.has(player.name.toLowerCase());
        if (isOnMap) continue;
        offMap.push({
            status: "offMap",
            id: player.id,
            name: player.name,
            reason: offMapReason(player.server),
        });
    }

    // 表示中のワールドを先頭に、残りは worldIds の順に並べる
    const worldOrder = [
        currentWorld,
        ...worldIds.filter((world) => world !== currentWorld),
    ];
    const groups: MapPlayerEntryGroup[] = worldOrder
        .map((world) => ({
            key: world,
            label: worldLabels[world],
            entries: (byWorld.get(world) ?? []).sort(byName),
        }))
        .filter((group) => group.entries.length > 0);

    if (offMap.length > 0) {
        groups.push({
            key: "off-map",
            label: "地図で追えない人",
            entries: offMap.sort(byName),
        });
    }
    return groups;
};
