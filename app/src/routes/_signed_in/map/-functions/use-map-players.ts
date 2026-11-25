import { useQuery } from "@tanstack/react-query";
import type { PlayersSnapshot } from "../-types/world-map";
import { buildPlayersUrl } from "./world-map-coords";

// squaremap はプレイヤーの位置を 1 秒ごとに書き出すが、通信量を抑えて 3 秒ごとに取る
const PLAYERS_REFETCH_INTERVAL = 3000;

/** オンラインのプレイヤーの位置を取得する (全ワールド分) */
export const useMapPlayers = (baseUrl: string, enabled: boolean) =>
    useQuery({
        queryKey: ["world-map", "players", baseUrl],
        queryFn: async (): Promise<PlayersSnapshot> => {
            const response = await fetch(buildPlayersUrl(baseUrl));
            if (!response.ok) {
                throw new Error(
                    `players.json の取得に失敗しました (${response.status})`,
                );
            }
            return (await response.json()) as PlayersSnapshot;
        },
        // 「プレイヤー」を隠しているあいだは取らない
        enabled,
        staleTime: 0,
        refetchInterval: PLAYERS_REFETCH_INTERVAL,
        // タブが裏にあるあいだは止める
        refetchIntervalInBackground: false,
    });
