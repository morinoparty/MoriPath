import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { StationLine } from "../-types/station";
import {
    AdvanceRailwayUnavailableError,
    fetchAdvanceRailway,
    groupDtoSchema,
    railwayDtoSchema,
} from "./advance-railway-api";

const stationLinesInputSchema = z.object({
    stationId: z.string().min(1),
});

const railwaysResponseSchema = z.object({
    railways: z.array(railwayDtoSchema),
});
const groupsResponseSchema = z.object({ groups: z.array(groupDtoSchema) });

/**
 * 駅に乗り入れている路線 (グループ) の名前と色を取得する。
 * 区間ごとの路線をグループでまとめ、同じ路線を 1 行にする。API を使えなければ null
 */
export const getStationLines = createServerFn()
    .validator(stationLinesInputSchema)
    .handler(
        // oxlint-disable-next-line typescript/no-explicit-any -- request is not typed
        async ({ data, request }: any): Promise<StationLine[] | null> => {
            const headers: Headers = request.headers;
            const stationId = encodeURIComponent(data.stationId);
            try {
                const [{ railways }, { groups }] = await Promise.all([
                    fetchAdvanceRailway(
                        headers,
                        `/stations/${stationId}/railways`,
                        railwaysResponseSchema,
                    ),
                    // グループは数十件なので 1 ページで足りる
                    fetchAdvanceRailway(
                        headers,
                        "/groups?limit=500",
                        groupsResponseSchema,
                    ),
                ]);
                const groupById = new Map(
                    groups.map((group) => [group.id, group]),
                );
                const lines = new Map<string, StationLine>();
                for (const railway of railways) {
                    const group = railway.group
                        ? groupById.get(railway.group)
                        : undefined;
                    // グループに属さない区間は路線名が無いので一覧に出さない
                    if (group && !lines.has(group.id)) {
                        lines.set(group.id, {
                            name: group.name,
                            color: group.color,
                        });
                    }
                }
                return [...lines.values()];
            } catch (error) {
                if (error instanceof AdvanceRailwayUnavailableError) {
                    return null;
                }
                throw error;
            }
        },
    );
