import { sva } from "../../../styled-system/css";
import type { ServerPlayerData } from "../../types/player";
import { PlayerMap } from "../player-map";

interface OnlineStatusProps {
    players: ServerPlayerData[];
}

export const OnlineStatus = ({ players }: OnlineStatusProps) => {
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
                    <PlayerMap
                        key={player.id}
                        uuid={player.id}
                        name={player.username}
                        size="md"
                    />
                ))}
            </div>
        </div>
    );
};
