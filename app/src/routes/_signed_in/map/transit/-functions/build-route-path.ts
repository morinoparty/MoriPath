import type { Vec2 } from "../../-types/world-map";
import type { TransitNetworkIndex, TransitRouteState } from "../-types/transit";
import type { RoutePathPart } from "../-types/transit-hero";

/**
 * 経路の区間を、地図に引く線に変える。座標の分からない駅は飛ばし、2 点に満たない線は引かない。
 * 経路が無ければ (見つからない・失敗など) null
 */
export const buildRoutePath = (
    state: TransitRouteState | null,
    index: TransitNetworkIndex,
): RoutePathPart[] | null => {
    if (state?.status !== "ok") return null;
    const pointOf = (id: string | null): Vec2[] => {
        const station = id ? index.stationById.get(id) : undefined;
        return station ? [station.point] : [];
    };
    const parts = state.route.segments.map((segment): RoutePathPart => {
        if (segment.kind === "rail") {
            return {
                kind: "rail",
                color: segment.color,
                // 乗る駅から降りる駅まで、途中の駅も通って引く
                points: segment.stationIds.flatMap(pointOf),
            };
        }
        // 歩く区間は駅と駅をまっすぐ結ぶ
        return {
            kind: "walk",
            color: null,
            points: [...pointOf(segment.fromId), ...pointOf(segment.toId)],
        };
    });
    return parts.filter((part) => part.points.length >= 2);
};
