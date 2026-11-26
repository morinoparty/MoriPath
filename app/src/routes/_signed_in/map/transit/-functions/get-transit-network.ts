import { createServerFn } from "@tanstack/react-start";
import {
    AdvanceRailwayUnavailableError,
    fetchRailwayDtos,
} from "../../-functions/advance-railway-api";
import type { TransitNetwork } from "../-types/transit";
import { buildTransitNetwork } from "./build-transit-network";

/** 駅とグループを全件取り、TransitNetwork にする。API を使えなければ null。ほかの失敗は throw */
export const getTransitNetwork = createServerFn().handler(
    // oxlint-disable-next-line typescript/no-explicit-any -- request is not typed
    async ({ request }: any): Promise<TransitNetwork | null> => {
        const headers: Headers = request.headers;
        try {
            const { stations, groups } = await fetchRailwayDtos(headers);
            return buildTransitNetwork(stations, groups);
        } catch (error) {
            // 権限が無いなど、使えないときは画面で「使えません」を出す
            if (error instanceof AdvanceRailwayUnavailableError) {
                return null;
            }
            throw error;
        }
    },
);
