import { useQuery } from "@tanstack/react-query";
import type { OnlineServerPlayerData } from "../../../types/player";
import { getOnlinePlayers } from "./get-online-players";

// オンラインの人数はすぐ変わるため、ホームを開いているあいだは 30 秒おきに取り直す
const REFRESH_INTERVAL_MS = 30 * 1000;

/**
 * ホームのオンライン一覧。loader で取った値を初期値にして、以降はクライアントで取り直す。
 * 取得できなかったときは null (ホームでは帯ごと出さない)
 */
export const useOnlinePlayers = (
    initialPlayers: OnlineServerPlayerData[] | null,
) =>
    useQuery({
        queryKey: ["home", "online-players"],
        queryFn: () => getOnlinePlayers(),
        initialData: initialPlayers ?? undefined,
        refetchInterval: REFRESH_INTERVAL_MS,
        // タブが裏にあるあいだは取り直さない
        refetchIntervalInBackground: false,
    });
