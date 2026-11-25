import type { ApiStation, MapStation, StationLine } from "../-types/station";
import type {
    CircleMarker,
    MarkerLayer,
    PolylineMarker,
    Vec2,
} from "../-types/world-map";
import {
    parseRailwayPopup,
    parseStationName,
    parseStationNumberings,
} from "./parse-railway-popup";

// 大きさの分からない駅の既定の半径 (AdvanceRailway の circleSizeBase と同じ)
const DEFAULT_STATION_RADIUS = 5;
// 路線の端点は駅の中心からずれていることがある (ホームの位置など)。
// このくらい (ブロック) までなら、いちばん近い駅に乗り入れているとみなす
const LINE_ENDPOINT_REACH = 40;

/** 座標を整数に丸めた比較用のキー (API は小数、squaremap は整数で持つ) */
const pointKey = ({ x, z }: Vec2) => `${Math.round(x)},${Math.round(z)}`;

/** 鉄道レイヤーから駅 (円) と路線 (折れ線) を取り出す */
export const splitRailwayLayer = (layer: MarkerLayer | undefined) => {
    const circles: CircleMarker[] = [];
    const polylines: PolylineMarker[] = [];
    for (const marker of layer?.markers ?? []) {
        if (marker.type === "circle") {
            circles.push(marker);
        } else if (marker.type === "polyline") {
            polylines.push(marker);
        }
    }
    return { circles, polylines };
};

/** squaremap の駅 (円) だけから駅を作る。路線の色は分からない */
const stationsFromCircles = (circles: CircleMarker[]): MapStation[] =>
    circles.flatMap((circle) => {
        const popup = circle.popup ?? "";
        const name = parseStationName(popup);
        if (!name) {
            return [];
        }
        return [
            {
                id: null,
                name,
                point: circle.center,
                radius: circle.radius,
                numberings: parseStationNumberings(popup).map((code) => ({
                    lineName: "",
                    code,
                    color: null,
                })),
            },
        ];
    });

/**
 * 表示中のワールドの駅を作る。
 * API の駅は Bukkit のワールド名を持ち、squaremap のワールド ID と対応が取れないため、
 * squaremap の駅 (円) と座標が一致した駅のワールドを、表示中のワールドとみなす。
 * API を使えないときは squaremap の駅だけで作る
 */
export const buildMapStations = (
    circles: CircleMarker[],
    apiStations: ApiStation[] | null,
): MapStation[] => {
    if (!apiStations) {
        return stationsFromCircles(circles);
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
            numberings: station.numberings,
        }));
};

/** 点にいちばん近い駅 (LINE_ENDPOINT_REACH より遠ければ undefined) */
const nearestStation = (point: Vec2, stations: MapStation[]) => {
    let nearest: MapStation | undefined;
    let nearestDistance = LINE_ENDPOINT_REACH;
    for (const station of stations) {
        const distance = Math.hypot(
            point.x - station.point.x,
            point.z - station.point.z,
        );
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
    polylines: PolylineMarker[],
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
        const { lineName } = parseRailwayPopup(polyline.popup ?? "");
        if (lineName && !lines.has(lineName)) {
            lines.set(lineName, {
                name: lineName,
                color: polyline.color ?? null,
            });
        }
    }
    return [...lines.values()];
};
