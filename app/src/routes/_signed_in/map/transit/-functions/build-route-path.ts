import type { TransitNetworkIndex, TransitRouteState } from "../-types/transit";
import type { RoutePathPart, RouteStop } from "../-types/transit-hero";

/**
 * 経路の区間を、地図に引く線 (通る駅の並び) に変える。座標の分からない駅は飛ばし、2 駅に満たない線は引かない。
 * 経路が無ければ (見つからない・失敗など) null
 */
export const buildRoutePath = (
    state: TransitRouteState | null,
    index: TransitNetworkIndex,
): RoutePathPart[] | null => {
    if (state?.status !== "ok") return null;
    const stopOf = (id: string | null): RouteStop[] => {
        const station = id ? index.stationById.get(id) : undefined;
        return station
            ? [
                  {
                      point: station.point,
                      names: [...new Set([station.fullName, station.name])],
                  },
              ]
            : [];
    };
    const parts = state.route.segments.map((segment): RoutePathPart => {
        if (segment.kind === "rail") {
            return {
                kind: "rail",
                color: segment.color,
                // 乗る駅から降りる駅まで、途中の駅も通って引く
                stops: segment.stationIds.flatMap(stopOf),
            };
        }
        // 歩く区間は駅と駅をまっすぐ結ぶ
        return {
            kind: "walk",
            color: null,
            stops: [...stopOf(segment.fromId), ...stopOf(segment.toId)],
        };
    });
    return parts.filter((part) => part.stops.length >= 2);
};
