import type { RailwayLine } from "../../-types/compact-markers";
import type { Vec2 } from "../../-types/world-map";
import type { RoutePathPart, RouteStop } from "../-types/transit-hero";

/** 地図に引く 1 本の線 (座標まで決まったもの) */
export interface TracedRoutePart {
    kind: RoutePathPart["kind"];
    color: string | null;
    points: Vec2[];
}

const pairKey = (from: string, to: string) => `${from}\u0000${to}`;

/** squaremap の路線を「乗る駅 → 降りる駅」の駅名で引けるようにする (逆向きも登録し、そのときは点を逆にする) */
export const indexRailwayLines = (
    lines: RailwayLine[],
): ReadonlyMap<string, Vec2[]> => {
    const byPair = new Map<string, Vec2[]>();
    for (const line of lines) {
        const { fromStation, toStation } = line.route;
        if (!fromStation || !toStation) continue;
        const points = line.points.map(([x, z]) => ({ x, z }));
        // 同じ駅の組が複数あれば最初の線を使う
        if (!byPair.has(pairKey(fromStation, toStation))) {
            byPair.set(pairKey(fromStation, toStation), points);
        }
        if (!byPair.has(pairKey(toStation, fromStation))) {
            byPair.set(pairKey(toStation, fromStation), [...points].reverse());
        }
    }
    return byPair;
};

/** 2 駅の間の線路の形。駅名の候補どうしで引き、見つからなければ null */
const findTrack = (
    byPair: ReadonlyMap<string, Vec2[]>,
    from: RouteStop,
    to: RouteStop,
): Vec2[] | null => {
    for (const fromName of from.names) {
        for (const toName of to.names) {
            const track = byPair.get(pairKey(fromName, toName));
            if (track) return track;
        }
    }
    return null;
};

/**
 * 経路の線を座標の並びにする。乗る区間は駅と駅の間を線路の形 (squaremap の路線) でつなぎ、
 * 線路が見つからない区間と歩く区間は駅をまっすぐ結ぶ
 */
export const traceRoutePath = (
    parts: RoutePathPart[],
    byPair: ReadonlyMap<string, Vec2[]>,
): TracedRoutePart[] =>
    parts.map((part) => {
        const points: Vec2[] = [];
        part.stops.forEach((stop, index) => {
            if (index === 0) {
                points.push(stop.point);
                return;
            }
            const previous = part.stops[index - 1];
            const track =
                part.kind === "rail" ? findTrack(byPair, previous, stop) : null;
            // 線路の端は駅の円の縁にあるので、駅の中心どうしもつないで途切れないようにする
            points.push(...(track ?? []), stop.point);
        });
        return { kind: part.kind, color: part.color, points };
    });
