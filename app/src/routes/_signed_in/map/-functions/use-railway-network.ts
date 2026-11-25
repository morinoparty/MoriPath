import { useQuery } from "@tanstack/react-query";
import { getRailwayNetwork } from "./get-railway-network";

// 駅や路線はめったに増えないので、開いているあいだは取り直さない
const RAILWAY_NETWORK_STALE_TIME = 30 * 60 * 1000;

/** AdvanceRailway の駅とグループ。API を使えなければ data は null */
export const useRailwayNetwork = (enabled: boolean) =>
    useQuery({
        queryKey: ["world-map", "railway-network"],
        queryFn: () => getRailwayNetwork(),
        // 「鉄道」を隠しているあいだは取らない
        enabled,
        staleTime: RAILWAY_NETWORK_STALE_TIME,
        // 失敗しても squaremap の駅で表示できるので、何度も試さない
        retry: 1,
    });
