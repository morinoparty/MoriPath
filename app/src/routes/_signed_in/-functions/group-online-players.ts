import { getServerLabel, getServerOrder } from "../../../lib/server-labels";
import type { OnlinePlayer, OnlinePlayerGroup } from "../-types/online-player";

/**
 * オンライン一覧をサーバーごとに分ける。
 * ロビー・メイン・資源の順に、知らないサーバーはそのあと表示名の順に並べる。誰もいないサーバーは出さない
 */
export const groupOnlinePlayers = (
    players: OnlinePlayer[],
): OnlinePlayerGroup[] => {
    // 各サーバーの中では、受け取った順 (名前順) をそのまま保つ
    const playersByServer = new Map<string, OnlinePlayer[]>();
    for (const player of players) {
        const serverPlayers = playersByServer.get(player.server) ?? [];
        serverPlayers.push(player);
        playersByServer.set(player.server, serverPlayers);
    }

    return [...playersByServer.entries()]
        .map(([server, serverPlayers]) => ({
            server,
            label: getServerLabel(server),
            players: serverPlayers,
        }))
        .sort(
            (a, b) =>
                getServerOrder(a.server) - getServerOrder(b.server) ||
                a.label.localeCompare(b.label, "ja"),
        );
};
