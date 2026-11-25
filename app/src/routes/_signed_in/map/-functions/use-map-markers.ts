import { useQuery } from "@tanstack/react-query";
import type { MarkerLayer, WorldId } from "../-types/world-map";
import { buildMarkersUrl } from "./world-map-coords";

/**
 * ワールドのマーカー (鉄道・保護範囲・バナーなど) を取得する。
 * オーバーワールドは保護範囲だけで 1 万件を超え、JSON が数 MB あるため、
 * プレイヤーのように数秒おきには取り直さず、数分おきにする
 */
export const useMapMarkers = (baseUrl: string, world: WorldId) =>
    useQuery({
        queryKey: ["world-map", "markers", baseUrl, world],
        queryFn: async (): Promise<MarkerLayer[]> => {
            const response = await fetch(buildMarkersUrl(baseUrl, world));
            if (!response.ok) {
                throw new Error(
                    `markers.json の取得に失敗しました (${response.status})`,
                );
            }
            return (await response.json()) as MarkerLayer[];
        },
        staleTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
        // タブが裏にあるあいだは取り直さない
        refetchIntervalInBackground: false,
    });
