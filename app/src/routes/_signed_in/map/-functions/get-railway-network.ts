import { createServerFn } from "@tanstack/react-start";
import type { ApiStation } from "../-types/station";
import {
    AdvanceRailwayUnavailableError,
    fetchRailwayDtos,
} from "./advance-railway-api";

/** 駅と路線 (グループ) の色。ポップアップの路線一覧でもグループの色を引く */
export interface RailwayNetwork {
    stations: ApiStation[];
    /** グループ ID → 名前と色 */
    groups: Record<string, { name: string; color: string }>;
}

/**
 * AdvanceRailway の駅とグループを取得する。
 * API を使えない (権限が無いなど) ときは null を返し、地図は squaremap の駅だけで描く
 */
export const getRailwayNetwork = createServerFn().handler(
    // oxlint-disable-next-line typescript/no-explicit-any -- request is not typed
    async ({ request }: any): Promise<RailwayNetwork | null> => {
        const headers: Headers = request.headers;
        try {
            const { stations, groups } = await fetchRailwayDtos(headers);
            const groupById = Object.fromEntries(
                groups.map((group) => [
                    group.id,
                    { name: group.name, color: group.color },
                ]),
            );
            return {
                groups: groupById,
                stations: stations.map((station) => ({
                    id: station.id,
                    name: station.name,
                    world: station.world,
                    point: { x: station.point.x, z: station.point.z },
                    overrideSize: station.overrideSize ?? null,
                    // 路線の並び順 (position) ではなく、グループの名前順で安定させる
                    numberings: station.numberings.map((numbering) => ({
                        lineName: numbering.groupName,
                        code: numbering.numbering ?? null,
                        color: groupById[numbering.group]?.color ?? null,
                    })),
                })),
            };
        } catch (error) {
            if (error instanceof AdvanceRailwayUnavailableError) {
                return null;
            }
            throw error;
        }
    },
);
