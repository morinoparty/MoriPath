import type { RouteResponseDto } from "../../-functions/advance-railway-api";
import type {
    RouteSegment,
    TransitNetworkIndex,
    TransitRoute,
} from "../-types/transit";
import { townsAlong } from "./build-transit-network";

type RouteLeg = RouteResponseDto["legs"][number];
type RailSegment = Extract<RouteSegment, { kind: "rail" }>;

/**
 * /route の応答を画面の形にする。
 * 応答は駅 1 つ分ずつの区間で来るので、同じ路線 (group) を続けて乗る区間を 1 つにまとめる
 */
export const buildTransitRoute = (
    dto: RouteResponseDto,
    index: TransitNetworkIndex,
): TransitRoute => {
    // 索引の表示名 (読みがなを除いた名前) を優先し、無ければ API の名前
    const stationName = (id: string | null, fallback: string) =>
        (id === null ? undefined : index.stationById.get(id)?.name) ?? fallback;

    const segments: RouteSegment[] = [];
    dto.legs.forEach((leg: RouteLeg, legIndex) => {
        // 最初の区間に from が無ければ、経路全体の出発駅から乗る
        const fromId = leg.from ?? (legIndex === 0 ? dto.from : null);
        const previous = segments.at(-1);

        if (leg.mode === "WALK") {
            // 続けて歩く区間は 1 つにまとめる
            if (previous?.kind === "walk") {
                previous.toId = leg.to;
                previous.toName = stationName(leg.to, leg.toName);
                previous.timeSeconds += leg.timeRequired;
                return;
            }
            segments.push({
                kind: "walk",
                fromId,
                fromName: stationName(fromId, leg.fromName ?? "現在地"),
                toId: leg.to,
                toName: stationName(leg.to, leg.toName),
                timeSeconds: leg.timeRequired,
            });
            return;
        }

        const group = leg.group ?? null;
        // 同じ路線を続けて乗るなら前の区間を伸ばす。無所属の区間はまとめない
        if (
            previous?.kind === "rail" &&
            previous.lineId !== null &&
            previous.lineId === group
        ) {
            previous.toId = leg.to;
            previous.toName = stationName(leg.to, leg.toName);
            previous.stationIds.push(leg.to);
            previous.stopCount = previous.stationIds.length;
            previous.timeSeconds += leg.timeRequired;
            return;
        }

        const line = group === null ? undefined : index.lineById.get(group);
        // 区間の始まりが分からなければ、前の区間の降りた駅から乗ったとみなす
        const startId = fromId ?? previous?.toId ?? leg.to;
        const segment: RailSegment = {
            kind: "rail",
            lineId: group,
            lineName: line?.name ?? leg.line ?? leg.railwaySlug ?? "路線",
            lineSubName: line?.subName ?? null,
            color: line?.color ?? null,
            prefix: line?.prefix ?? null,
            fromId: startId,
            fromName: stationName(
                startId,
                leg.fromName ?? previous?.toName ?? "",
            ),
            toId: leg.to,
            toName: stationName(leg.to, leg.toName),
            stopCount: 2,
            timeSeconds: leg.timeRequired,
            stationIds: [startId, leg.to],
            towns: [],
        };
        segments.push(segment);
    });

    // 街は区間の駅が決まってからまとめて出す
    for (const segment of segments) {
        if (segment.kind === "rail") {
            segment.towns = townsAlong(segment.stationIds, index.stationById);
        }
    }

    const railCount = segments.filter(
        (segment) => segment.kind === "rail",
    ).length;
    return {
        from: index.stationById.get(dto.from) ?? null,
        to: index.stationById.get(dto.to) ?? null,
        fromName: stationName(dto.from, dto.fromName),
        toName: stationName(dto.to, dto.toName),
        totalSeconds: dto.totalTime,
        // 歩く区間は乗りかえに数えない
        transfers: Math.max(0, railCount - 1),
        segments,
    };
};
