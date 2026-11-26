import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
    AdvanceRailwayHttpError,
    AdvanceRailwayUnavailableError,
    fetchAdvanceRailway,
    type RouteResponseDto,
    routeResponseSchema,
} from "../../-functions/advance-railway-api";
import { stationSlugSchema } from "./transit-search";

const transitRouteInputSchema = z.object({
    from: stationSlugSchema,
    to: stationSlugSchema,
});

/** 経路検索の応答。失敗は画面で出し分ける種類だけを返し、それ以外は throw する */
export type TransitRouteResponse =
    | { status: "ok"; route: RouteResponseDto }
    | { status: "noRoute" | "sameStation" | "stationNotFound" | "unavailable" };

/** AdvanceRailway の GET /route で 2 駅の経路を調べる */
export const getTransitRoute = createServerFn()
    .validator(transitRouteInputSchema)
    .handler(
        // oxlint-disable-next-line typescript/no-explicit-any -- request is not typed
        async ({ data, request }: any): Promise<TransitRouteResponse> => {
            const headers: Headers = request.headers;
            const from = encodeURIComponent(data.from);
            const to = encodeURIComponent(data.to);
            try {
                const route = await fetchAdvanceRailway(
                    headers,
                    `/route?from=${from}&to=${to}`,
                    routeResponseSchema,
                );
                return { status: "ok", route };
            } catch (error) {
                if (error instanceof AdvanceRailwayUnavailableError) {
                    return { status: "unavailable" };
                }
                if (error instanceof AdvanceRailwayHttpError) {
                    // 400 は同じ駅どうし (same_station)
                    if (error.status === 400) {
                        return { status: "sameStation" };
                    }
                    // 404 は経路が無い (no_route) か、駅が無い (station_not_found)
                    if (error.status === 404) {
                        return error.code === "no_route"
                            ? { status: "noRoute" }
                            : { status: "stationNotFound" };
                    }
                }
                throw error;
            }
        },
    );
