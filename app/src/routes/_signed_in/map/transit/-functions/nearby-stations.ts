import type { Town, TownSlug } from "../-types/town";
import type {
    NearbyStation,
    SelfPosition,
    TransitStation,
} from "../-types/transit";
import { DEFAULT_TOWN, towns } from "./town-stations";

// 近い駅の既定の件数
const DEFAULT_NEARBY_LIMIT = 3;

// 水平距離の 2 乗 (並べるだけなので平方根を取らない)
const squaredDistance = (
    a: { x: number; z: number },
    b: { x: number; z: number },
) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2;

/** 同じワールドで近い順に limit 件 (既定 3)。worldId が一致しない駅は除く */
export const findNearbyStations = (
    stations: readonly TransitStation[],
    position: SelfPosition,
    limit: number = DEFAULT_NEARBY_LIMIT,
): NearbyStation[] =>
    stations
        .filter((station) => station.worldId === position.world)
        .map((station) => ({
            station,
            squared: squaredDistance(station.point, position),
        }))
        .sort((a, b) => a.squared - b.squared)
        .slice(0, limit)
        .map(({ station, squared }) => ({
            station,
            distance: Math.round(Math.sqrt(squared)),
        }));

/** ヒーローに出す街: 駅が街の駅ならその街、そうでなければ同じワールドでいちばん近い街の駅の街、駅が無ければ DEFAULT_TOWN */
export const resolveHeroTown = (
    station: TransitStation | null,
    stations: readonly TransitStation[],
): TownSlug => {
    if (station === null) return DEFAULT_TOWN;
    if (station.town !== null) return station.town;
    let nearest: { town: TownSlug; squared: number } | null = null;
    for (const candidate of stations) {
        // 街の駅で、同じワールドにあるものだけを比べる
        if (candidate.town === null || candidate.world !== station.world) {
            continue;
        }
        const squared = squaredDistance(candidate.point, station.point);
        if (nearest === null || squared < nearest.squared) {
            nearest = { town: candidate.town, squared };
        }
    }
    return nearest?.town ?? DEFAULT_TOWN;
};

/** 駅の街 (街の駅だけ)。一覧の「街のヒント」に使う。街の駅でなければ null (「街の外」とは書かない) */
export const townOf = (station: TransitStation): Town | null =>
    station.town === null ? null : towns[station.town];
