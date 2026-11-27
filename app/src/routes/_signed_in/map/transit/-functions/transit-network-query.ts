import { queryOptions } from "@tanstack/react-query";
import { getWorldMapUrlFn } from "../../-functions/get-world-map-url";
import { getTransitNetwork } from "./get-transit-network";

// 駅や路線はめったに変わらないので、30 分は取り直さない
const TRANSIT_NETWORK_STALE_MS = 30 * 60 * 1000;

/** loader の ensureQueryData 専用。from/to が変わって loader が呼び直されても駅一覧を取り直さない */
export const transitNetworkQueryOptions = queryOptions({
    queryKey: ["transit", "network"],
    queryFn: () => getTransitNetwork(),
    staleTime: TRANSIT_NETWORK_STALE_MS,
    // useQuery で購読しないので、既定 (5 分) のままだと staleTime より先に捨てられる。staleTime のあいだは残す
    gcTime: TRANSIT_NETWORK_STALE_MS,
});

/** loader の ensureQueryData 専用。地図の取得元はデプロイ中に変わらないので、from/to が変わっても聞き直さない */
export const transitWorldMapUrlQueryOptions = queryOptions({
    queryKey: ["transit", "world-map-url"],
    queryFn: () => getWorldMapUrlFn(),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
});
