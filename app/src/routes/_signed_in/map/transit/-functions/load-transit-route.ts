import type { TransitNetwork, TransitRouteState } from "../-types/transit";
import { buildTransitRoute } from "./build-transit-route";
import { getTransitRoute } from "./get-transit-route";
import { indexTransitNetwork } from "./index-transit-network";

/** loader 用。どちらかが未指定なら null。索引に無い slug は stationNotFound、同じ駅は sameStation (API を呼ばない)。予期しない失敗は { status: "error" } (throw しない) */
export const loadTransitRoute = async (
    network: TransitNetwork | null,
    from: string | undefined,
    to: string | undefined,
): Promise<TransitRouteState | null> => {
    if (from === undefined || to === undefined) {
        return null;
    }
    // 駅一覧を読めないときは経路も調べられない
    if (network === null) {
        return { status: "unavailable" };
    }
    const index = indexTransitNetwork(network);
    if (!index.stationBySlug.has(from) || !index.stationBySlug.has(to)) {
        return { status: "stationNotFound" };
    }
    if (from === to) {
        return { status: "sameStation" };
    }
    try {
        const response = await getTransitRoute({ data: { from, to } });
        if (response.status !== "ok") {
            return { status: response.status };
        }
        return {
            status: "ok",
            route: buildTransitRoute(response.route, index),
        };
    } catch (error) {
        // 画面全体をエラーにせず、経路の欄で再試行できるようにする
        console.error("Failed to load the transit route", error);
        return { status: "error" };
    }
};
