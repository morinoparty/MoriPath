import type {
    PointTuple,
    RailwayCircle,
    RailwayLine,
} from "../-types/compact-markers";

// 駅の円の外側でも、このくらい (ブロック) までに路線が通っていれば駅に乗り入れているとみなす。
// 実データでは 3 だと端点がホームの位置にずれた駅 (RES02 など) が票を入れられず、8 以上で結果が安定した
const STATION_LINE_TOLERANCE = 8;

/** 「PAK08」「PAK 08」から路線の記号「PAK」を取り出す。記号が無ければ null */
export const numberingPrefix = (code: string): string | null => {
    const match = code.match(/^\s*([^\d\s]+)/);
    return match ? match[1] : null;
};

/** 点から線分までの距離 (ブロック) */
const distanceToSegment = (
    [px, pz]: PointTuple,
    [ax, az]: PointTuple,
    [bx, bz]: PointTuple,
) => {
    const dx = bx - ax;
    const dz = bz - az;
    const lengthSquared = dx * dx + dz * dz;
    // 線分上でいちばん近い位置 (0〜1)。長さ 0 の線分は端点そのもの
    const t =
        lengthSquared === 0
            ? 0
            : Math.max(
                  0,
                  Math.min(
                      1,
                      ((px - ax) * dx + (pz - az) * dz) / lengthSquared,
                  ),
              );
    return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
};

/** 点から折れ線までの距離 (ブロック) */
export const distanceToPolyline = (
    point: PointTuple,
    points: PointTuple[],
): number => {
    if (points.length === 1) {
        return Math.hypot(point[0] - points[0][0], point[1] - points[0][1]);
    }
    let nearest = Number.POSITIVE_INFINITY;
    for (let i = 0; i < points.length - 1; i++) {
        nearest = Math.min(
            nearest,
            distanceToSegment(point, points[i], points[i + 1]),
        );
    }
    return nearest;
};

/** 路線が駅に乗り入れているか (駅の近くを通るか、乗換案内の行き先がその駅か) */
const servesStation = (circle: RailwayCircle, line: RailwayLine) => {
    const { route } = line;
    if (
        circle.name &&
        (route.fromStation === circle.name || route.toStation === circle.name)
    ) {
        return true;
    }
    const center: PointTuple = [circle.center.x, circle.center.z];
    return (
        distanceToPolyline(center, line.points) <=
        circle.radius + STATION_LINE_TOLERANCE
    );
};

/**
 * squaremap の駅と路線から、ナンバリングの記号ごとの路線の色を推定する。
 * squaremap の駅の円の色は駅ごとにばらばらで、路線名にも記号が無いため、
 * 「同じ記号の駅はいつも同じ路線の上にある」ことを使って多数決で決める。
 * 駅ごとに (記号 × 乗り入れている路線の色) へ 1 票ずつ入れ、記号ごとに最多の色を選ぶ。
 * 同数で決められない記号は入れない (ブランド色で表示する)
 */
export const buildNumberingColors = (
    circles: RailwayCircle[],
    lines: RailwayLine[],
): Record<string, string> => {
    // 記号 → 色 → 票数
    const votes = new Map<string, Map<string, number>>();
    for (const circle of circles) {
        // 同じ色の路線が何本乗り入れていても、1 駅からは 1 票にする
        const colors = new Set(
            lines
                .filter((line) => line.color && servesStation(circle, line))
                .map((line) => line.color),
        );
        for (const code of circle.numberings) {
            const prefix = numberingPrefix(code);
            if (!prefix) {
                continue;
            }
            const tally = votes.get(prefix) ?? new Map<string, number>();
            for (const color of colors) {
                tally.set(color, (tally.get(color) ?? 0) + 1);
            }
            votes.set(prefix, tally);
        }
    }
    const result: Record<string, string> = {};
    for (const [prefix, tally] of votes) {
        const ranked = [...tally].sort((a, b) => b[1] - a[1]);
        const [first, second] = ranked;
        // 1 位が同数なら、どちらの路線の記号か分からないので決めない
        if (first && (!second || first[1] > second[1])) {
            result[prefix] = first[0];
        }
    }
    return result;
};
