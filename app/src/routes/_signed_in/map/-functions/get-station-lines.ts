import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { StationLine } from "../-types/station";
import {
    AdvanceRailwayUnavailableError,
    fetchAdvanceRailway,
    groupDtoSchema,
    railwayDtoSchema,
    stationDtoSchema,
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
 * 駅にナンバリングが付いている路線を先に (ナンバリングの順で) 並べ、続けて区間だけでつながる路線を足す。
 * 他の路線の線路に乗り入れる路線 (例: もりもとの聖花線) は区間が無いため、ナンバリングからも拾う。
 * 同じ路線は 1 行にまとめる。API を使えなければ null
 */
export const getStationLines = createServerFn()
    .validator(stationLinesInputSchema)
    .handler(
        // oxlint-disable-next-line typescript/no-explicit-any -- request is not typed
        async ({ data, request }: any): Promise<StationLine[] | null> => {
            const headers: Headers = request.headers;
            const stationId = encodeURIComponent(data.stationId);
            try {
                const [station, { railways }, { groups }] = await Promise.all([
                    fetchAdvanceRailway(
                        headers,
                        `/stations/${stationId}`,
                        stationDtoSchema,
                    ),
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
                const addGroup = (groupId: string | null | undefined) => {
                    const group = groupId ? groupById.get(groupId) : undefined;
                    // グループに属さない区間は路線名が無いので一覧に出さない
                    if (group && !lines.has(group.id)) {
                        lines.set(group.id, {
                            name: group.name,
                            color: group.color,
                        });
                    }
                };
                // 駅の札と同じ順に並ぶよう、ナンバリングの路線を先に入れる
                for (const numbering of station.numberings) {
                    addGroup(numbering.group);
                }
                for (const railway of railways) {
                    addGroup(railway.group);
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
