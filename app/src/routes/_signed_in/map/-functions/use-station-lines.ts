import { useQuery } from "@tanstack/react-query";
import { getStationLines } from "./get-station-lines";

/** 駅に乗り入れている路線を、ポップアップを開いたときにだけ取得する */
export const useStationLines = (stationId: string | null) =>
    useQuery({
        queryKey: ["world-map", "station-lines", stationId],
        // enabled で null を除いているので stationId は必ずある
        queryFn: () =>
            getStationLines({ data: { stationId: stationId ?? "" } }),
        enabled: stationId !== null,
        staleTime: 30 * 60 * 1000,
        retry: 1,
    });
