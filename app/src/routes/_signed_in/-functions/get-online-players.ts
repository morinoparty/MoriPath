import { createServerFn } from "@tanstack/react-start";
import { MINEAUTH_API_TIMEOUT_MS } from "../../../lib/mineauth-timeout";
import { getServers, getServerUrl } from "../../../lib/server-list";
import type {
    OnlineServerPlayerData,
    ServerPlayerData,
} from "../../../types/player";

export const getOnlinePlayers = createServerFn().handler(async () => {
    const servers = await getServers();

    // 一覧はサーバーごとに取るため、取った先のサーバー ID をそれぞれに付ける
    const players = await Promise.all(
        servers.map((server) =>
            fetch(`${getServerUrl(server)}/api/v1/commons/server/players`, {
                signal: AbortSignal.timeout(MINEAUTH_API_TIMEOUT_MS),
            })
                .then((res) => res.json() as Promise<ServerPlayerData[]>)
                .then((serverPlayers) =>
                    serverPlayers.map((player): OnlineServerPlayerData => ({
                        ...player,
                        server,
                    })),
                )
                // 落ちているサーバーが 1 台あっても、ほかのサーバーの人数は出す
                .catch(() => [] as OnlineServerPlayerData[]),
        ),
    ).then((results) => results.flat());

    // サーバー間の移動中に同じ人が 2 か所に出ることがあるため、UUID で 1 人にまとめる
    // (アバターの一覧は id を React の key に使う)。サーバーはあとに取れたほうが残る
    const uniquePlayers = [
        ...new Map(players.map((player) => [player.id, player])).values(),
    ];

    uniquePlayers.sort((a, b) => {
        const aFirstCharacter = a.username.toLowerCase().charAt(0);
        const bFirstCharacter = b.username.toLowerCase().charAt(0);
        if (aFirstCharacter === bFirstCharacter) {
            return 0;
        }
        return aFirstCharacter < bFirstCharacter ? -1 : 1;
    });

    return uniquePlayers;
});

export type OnlinePlayersData = Awaited<ReturnType<typeof getOnlinePlayers>>;
