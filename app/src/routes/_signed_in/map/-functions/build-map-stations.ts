import type {
    PointTuple,
    RailwayCircle,
    RailwayLine,
} from "../-types/compact-markers";
import type { ApiStation, MapStation, StationLine } from "../-types/station";
import type { Vec2 } from "../-types/world-map";
import { numberingPrefix } from "./numbering-colors";

// 大きさの分からない駅の既定の半径 (AdvanceRailway の circleSizeBase と同じ)
const DEFAULT_STATION_RADIUS = 5;
// 路線の端点は駅の中心からずれていることがある (ホームの位置など)。
// このくらい (ブロック) までなら、いちばん近い駅に乗り入れているとみなす
const LINE_ENDPOINT_REACH = 40;

/** 座標を整数に丸めた比較用のキー (API は小数、squaremap は整数で持つ) */
const pointKey = ({ x, z }: Vec2) => `${Math.round(x)},${Math.round(z)}`;

/** ナンバリングの記号から、squaremap から推定した路線の色を引く */
const colorOfCode = (
    code: string | null,
    numberingColors: Record<string, string>,
): string | null => {
    const prefix = code ? numberingPrefix(code) : null;
    return (prefix && numberingColors[prefix]) || null;
};

/** squaremap の駅 (円) だけから駅を作る。札の色は記号から推定した路線の色にする */
const stationsFromCircles = (
    circles: RailwayCircle[],
    numberingColors: Record<string, string>,
): MapStation[] =>
    circles.flatMap((circle) => {
        const { name } = circle;
        if (!name) {
            return [];
        }
        return [
            {
                id: null,
                name,
                point: circle.center,
                radius: circle.radius,
                numberings: circle.numberings.map((code) => ({
                    lineName: "",
                    code,
                    color: colorOfCode(code, numberingColors),
                })),
            },
        ];
    });

/**
 * 表示中のワールドの駅を作る。
 * API の駅は Bukkit のワールド名を持ち、squaremap のワールド ID と対応が取れないため、
 * squaremap の駅 (円) と座標が一致した駅のワールドを、表示中のワールドとみなす。
 * API を使えないときは squaremap の駅だけで作る。
 * 札の色は API の路線の色を優先し、無ければ squaremap から推定した色 (numberingColors) を使う
 */
export const buildMapStations = (
    circles: RailwayCircle[],
    apiStations: ApiStation[] | null,
    numberingColors: Record<string, string> = {},
): MapStation[] => {
    if (!apiStations) {
        return stationsFromCircles(circles, numberingColors);
    }
    // 駅の大きさは squaremap の円の半径 (overrideSize か接続路線数から決まる) を使う
    const radiusByPoint = new Map(
        circles.map((circle) => [pointKey(circle.center), circle.radius]),
    );
    const worlds = new Set(
        apiStations
            .filter((station) => radiusByPoint.has(pointKey(station.point)))
            .map((station) => station.world),
    );
    return apiStations
        .filter((station) => worlds.has(station.world))
        .map((station) => ({
            id: station.id,
            name: station.name,
            point: station.point,
            radius:
                radiusByPoint.get(pointKey(station.point)) ??
                station.overrideSize ??
                DEFAULT_STATION_RADIUS,
            numberings: station.numberings.map((numbering) => ({
                ...numbering,
                color:
                    numbering.color ??
                    colorOfCode(numbering.code, numberingColors),
            })),
        }));
};

/** 点にいちばん近い駅 (LINE_ENDPOINT_REACH より遠ければ undefined) */
const nearestStation = ([x, z]: PointTuple, stations: MapStation[]) => {
    let nearest: MapStation | undefined;
    let nearestDistance = LINE_ENDPOINT_REACH;
    for (const station of stations) {
        const distance = Math.hypot(x - station.point.x, z - station.point.z);
        if (distance <= nearestDistance) {
            nearest = station;
            nearestDistance = distance;
        }
    }
    return nearest;
};

/**
 * squaremap の路線 (折れ線) から、駅に乗り入れている路線を求める。
 * 路線の端点をいちばん近い駅に割り当て、その駅の路線とする。
 * API を使えないときのポップアップの路線一覧に使う
 */
export const findLinesAtStation = (
    station: MapStation,
    stations: MapStation[],
    polylines: RailwayLine[],
): StationLine[] => {
    const lines = new Map<string, StationLine>();
    for (const polyline of polylines) {
        const ends = [
            polyline.points[0],
            polyline.points[polyline.points.length - 1],
        ];
        const reachesStation = ends.some(
            (end) =>
                end !== undefined && nearestStation(end, stations) === station,
        );
        if (!reachesStation) {
            continue;
        }
        const { lineName } = polyline.route;
        if (lineName && !lines.has(lineName)) {
            lines.set(lineName, {
                name: lineName,
                color: polyline.color || null,
            });
        }
    }
    return [...lines.values()];
};
