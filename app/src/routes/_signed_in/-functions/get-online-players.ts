import { createServerFn } from "@tanstack/react-start";
import { getServers, getServerUrl } from "../../../lib/server-list";
import type { ServerPlayerData } from "../../../types/player";

export const getOnlinePlayers = createServerFn().handler(async () => {
    // サーバー一覧は `${SERVER_URL}servers` から取得する
    const servers = await getServers();

    const players = await Promise.all(
        servers.map((server) =>
            fetch(
                `${getServerUrl(server)}/api/v1/commons/server/players`,
                {},
            ).then((res) => res.json() as Promise<ServerPlayerData[]>),
        ),
    ).then((results) => results.flat());

    players.sort((a, b) => {
        const aFirstCharacter = a.username.toLowerCase().charAt(0);
        const bFirstCharacter = b.username.toLowerCase().charAt(0);
        if (aFirstCharacter === bFirstCharacter) {
            return 0;
        }
        return aFirstCharacter < bFirstCharacter ? -1 : 1;
    });

    return players;
});

export type OnlinePlayersData = Awaited<ReturnType<typeof getOnlinePlayers>>;
