import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Vec2, WorldId } from "../-types/world-map";
import { buildWorldSettingsUrl } from "./world-map-coords";

// settings.json のうち /map で使うのはスポーン地点だけ
interface WorldSettings {
    spawn: Vec2;
}

/** ワールドのスポーン地点を取得する (初期表示とワールド切り替え時の中心に使う) */
export const useWorldSettings = (baseUrl: string | null, world: WorldId) =>
    useQuery({
        queryKey: ["world-map", "settings", baseUrl, world],
        queryFn: async (): Promise<WorldSettings> => {
            // enabled で null を除いているので baseUrl は必ずある
            const response = await fetch(
                buildWorldSettingsUrl(baseUrl ?? "", world),
            );
            if (!response.ok) {
                throw new Error(
                    `settings.json の取得に失敗しました (${response.status})`,
                );
            }
            const settings = (await response.json()) as Partial<WorldSettings>;
            // スポーン地点が無いワールドは原点を中心にする
            return { spawn: settings.spawn ?? { x: 0, z: 0 } };
        },
        // URL が未設定の環境では取得しない
        enabled: baseUrl !== null,
        // ワールドを切り替えた直後も前のスポーン地点を返し、地図を作り直さずに移動させる
        placeholderData: keepPreviousData,
        // スポーン地点はほとんど変わらないので取り直さない
        staleTime: Number.POSITIVE_INFINITY,
    });
