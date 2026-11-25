import { queryOptions } from "@tanstack/react-query";
import type { OnlinePlayer } from "../-types/online-player";
import { getOnlinePlayers } from "./get-online-players";

// オンラインの人数はすぐ変わるため、ホームを開いているあいだは 30 秒おきに取り直す
const REFRESH_INTERVAL_MS = 30 * 1000;

/**
 * ホームのオンライン一覧。loader で取り始め、届くまでは帯のスケルトンを出す。
 * 取得できなかったときは null (ホームでは帯ごと出さない)
 */
export const onlinePlayersQueryOptions = queryOptions({
    queryKey: ["home", "online-players"],
    queryFn: (): Promise<OnlinePlayer[] | null> =>
        getOnlinePlayers()
            // サーバーの username を一覧の表示名 (name) にそろえる
            .then((players) =>
                players.map((player) => ({
                    id: player.id,
                    name: player.username,
                    server: player.server,
                })),
            )
            .catch((error: unknown) => {
                console.warn("オンライン一覧を取得できません:", error);
                return null;
            }),
    refetchInterval: REFRESH_INTERVAL_MS,
    // タブが裏にあるあいだは取り直さない
    refetchIntervalInBackground: false,
});
