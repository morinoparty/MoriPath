import type { PointTuple, RailwayLine } from "../-types/compact-markers";
import type { MapStation } from "../-types/station";
import type { Vec2 } from "../-types/world-map";
import { distanceToPolyline } from "./numbering-colors";

// 指で押せる最小の当たり判定の半径 (px)。押しやすい大きさ 44px の半分
export const MIN_STATION_HIT_RADIUS = 22;
// 拡大したときの当たり判定の半径の上限 (px)。大きな駅が周りの路線や保護範囲のタップを奪わないようにする
export const MAX_STATION_HIT_RADIUS = 32;

/** 地図に描いた駅の札・点の大きさ (px、中心からの半分の幅と高さ) */
export interface StationFootprint {
    halfWidth: number;
    halfHeight: number;
}

/** 当たり判定に使う路線の描き方 (px) */
export interface LineHitOptions {
    /** 線の太さの半分 */
    halfWeight: number;
    /** 線の外側でもタップを拾う距離 (Leaflet の renderer の tolerance) */
    tolerance: number;
}

export interface StationHitTestInput {
    /** タップした位置 (ブロック) */
    tap: Vec2;
    /** 今の縮尺での 1 ブロックの大きさ (px) */
    pxPerBlock: number;
    stations: MapStation[];
    /** 駅ごとの、地図に描いた札・点の大きさ */
    footprintOf: (station: MapStation) => StationFootprint;
    lines: RailwayLine[];
    line: LineHitOptions;
}

/** 中心から (halfWidth, halfHeight) の四角の外側までの距離。中にあれば 0 */
const distanceToBox = (
    dx: number,
    dz: number,
    { halfWidth, halfHeight }: StationFootprint,
) =>
    Math.hypot(
        Math.max(0, Math.abs(dx) - halfWidth),
        Math.max(0, Math.abs(dz) - halfHeight),
    );

/**
 * タップした位置で選ぶ駅を決める。選ばなければ null (路線や保護範囲に任せる)。
 * - 当たり判定の半径 (px) は、駅の円の画面上の半径を MIN〜MAX に収めたもの。
 *   縮小しても指で押せる大きさを保ち、拡大しても周りのタップを奪いすぎない
 * - 範囲内の駅が複数あれば中心がいちばん近い駅
 * - 同じ位置で路線もタップできるときは、描いた形 (札・点と線) の近いほうを選ぶ。
 *   路線は駅の中心を通るので、中心どうしではなく札の外側と線の外側の距離で比べる (同じなら駅)
 */
export const hitTestStation = ({
    tap,
    pxPerBlock,
    stations,
    footprintOf,
    lines,
    line,
}: StationHitTestInput): MapStation | null => {
    let best: { station: MapStation; centerPx: number; gapPx: number } | null =
        null;
    for (const station of stations) {
        const dx = (tap.x - station.point.x) * pxPerBlock;
        const dz = (tap.z - station.point.z) * pxPerBlock;
        const centerPx = Math.hypot(dx, dz);
        const gapPx = distanceToBox(dx, dz, footprintOf(station));
        const hitRadius = Math.min(
            Math.max(station.radius * pxPerBlock, MIN_STATION_HIT_RADIUS),
            MAX_STATION_HIT_RADIUS,
        );
        // 札・点そのものを押したときは、半径の外でも駅にする
        const isHit = gapPx === 0 || centerPx <= hitRadius;
        if (isHit && (!best || centerPx < best.centerPx)) {
            best = { station, centerPx, gapPx };
        }
    }
    if (!best) {
        return null;
    }
    // 札に触れていれば路線と比べるまでもない
    if (best.gapPx === 0) {
        return best.station;
    }
    // タップを拾える範囲にある路線のうち、線の外側までがいちばん近いもの
    const tapPoint: PointTuple = [tap.x, tap.z];
    let lineGapPx = Number.POSITIVE_INFINITY;
    for (const railwayLine of lines) {
        const gap = Math.max(
            0,
            distanceToPolyline(tapPoint, railwayLine.points) * pxPerBlock -
                line.halfWeight,
        );
        lineGapPx = Math.min(lineGapPx, gap);
    }
    const lineIsTappable = lineGapPx <= line.tolerance;
    return !lineIsTappable || best.gapPx <= lineGapPx ? best.station : null;
};
