import { sva } from "@/styled-system/css";
import type { ServerPlayerData } from "../types/player";
import { PlayerMap } from "./player-map";

export const OnlineStatus = async () => {
    const onlineStatusStyle = sva({
        slots: [
            "root",
            "onlineCount",
            "label",
            "countWrapper",
            "count",
            "unit",
            "playerMap",
        ],
        base: {
            root: {
                display: "flex",
                alignItems: "center",
                flexDirection: "row",
                bgColor: "var(--chakra-colors-color-palette-500)",
                color: "var(--chakra-colors-color-palette-50)",
                paddingLeft: "24px",
                gap: "2rem",
                height: "72px",
                fontWeight: "bold",
            },
            onlineCount: {
                display: "flex",
                flexShrink: 0,
                flexDirection: "column",
                gap: "1",
            },
            label: {
                fontSize: "md",
                lineHeight: "1",
                opacity: 0.6,
            },
            countWrapper: {
                display: "flex",
                alignItems: "baseline",
            },
            count: {
                fontSize: "2xl",
                lineHeight: "1",
            },
            unit: {
                fontSize: "md",
                lineHeight: "1",
            },
            playerMap: {
                display: "flex",
                overflowX: "auto",
                gap: "12px",
                flexShrink: 1,
                maxWidth: "100%",
                minHeight: "48px",
                whiteSpace: "nowrap",
                alignItems: "center",
            },
        },
    });
    const style = onlineStatusStyle();
    const servers = (process.env.SERVERS as string).split(",");
    const players = await Promise.all(
        servers.map((server) =>
            fetch(
                `${process.env.SERVER_URL}${server}/api/v1/commons/server/players`,
                {},
            ).then((res) => res.json<ServerPlayerData[]>()),
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
    return (
        <div className={style.root}>
            <div className={style.onlineCount}>
                <div className={style.label}>オンライン</div>
                <div className={style.countWrapper}>
                    <div className={style.count}>{players.length}</div>
                    <div className={style.unit}>人</div>
                </div>
            </div>
            <div className={style.playerMap}>
                {players.map((player) => (
                    <PlayerMap key={player.id} uuid={player.id} size={32} />
                ))}
            </div>
        </div>
    );
};
