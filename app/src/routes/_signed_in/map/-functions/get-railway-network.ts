import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ApiStation } from "../-types/station";
import {
    AdvanceRailwayUnavailableError,
    fetchAdvanceRailway,
    groupDtoSchema,
    stationDtoSchema,
} from "./advance-railway-api";

// API の 1 ページの上限
const PAGE_SIZE = 500;

const stationsResponseSchema = z.object({
    stations: z.array(stationDtoSchema),
});
const groupsResponseSchema = z.object({ groups: z.array(groupDtoSchema) });

/** 駅と路線 (グループ) の色。ポップアップの路線一覧でもグループの色を引く */
export interface RailwayNetwork {
    stations: ApiStation[];
    /** グループ ID → 名前と色 */
    groups: Record<string, { name: string; color: string }>;
}

/** ページングをたどって全件を取る */
const fetchAllPages = async <T>(
    fetchPage: (offset: number) => Promise<T[]>,
): Promise<T[]> => {
    const items: T[] = [];
    for (let offset = 0; ; offset += PAGE_SIZE) {
        const page = await fetchPage(offset);
        items.push(...page);
        if (page.length < PAGE_SIZE) {
            return items;
        }
    }
};

/**
 * AdvanceRailway の駅とグループを取得する。
 * API を使えない (権限が無いなど) ときは null を返し、地図は squaremap の駅だけで描く
 */
export const getRailwayNetwork = createServerFn().handler(
    // oxlint-disable-next-line typescript/no-explicit-any -- request is not typed
    async ({ request }: any): Promise<RailwayNetwork | null> => {
        const headers: Headers = request.headers;
        try {
            const [stations, groups] = await Promise.all([
                fetchAllPages(async (offset) => {
                    const page = await fetchAdvanceRailway(
                        headers,
                        `/stations?limit=${PAGE_SIZE}&offset=${offset}`,
                        stationsResponseSchema,
                    );
                    return page.stations;
                }),
                fetchAllPages(async (offset) => {
                    const page = await fetchAdvanceRailway(
                        headers,
                        `/groups?limit=${PAGE_SIZE}&offset=${offset}`,
                        groupsResponseSchema,
                    );
                    return page.groups;
                }),
            ]);
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
