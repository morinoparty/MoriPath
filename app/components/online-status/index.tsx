import type { PropsWithChildren, ReactNode } from "react";
import { createContext, useContext } from "react";
import { sva } from "../../../styled-system/css";
import type { ServerPlayerData } from "../../types/player";
import { PlayerMap } from "../player-map";

interface OnlineStatusProps {
    players: ServerPlayerData[];
}

interface OnlineStatusContextValue {
    players: ServerPlayerData[];
}

const OnlineStatusContext = createContext<OnlineStatusContextValue | null>(
    null,
);

const useOnlineStatusContext = () => {
    const context = useContext(OnlineStatusContext);
    if (!context) {
        throw new Error(
            "OnlineStatus components must be used within OnlineStatus.Root",
        );
    }
    return context;
};

const onlineStatusStyle = sva({
    slots: [
        "root",
        "onlineCount",
        "label",
        "countWrapper",
        "count",
        "unit",
        "playerList",
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
            gap: "1",
        },
        count: {
            fontSize: "2xl",
            lineHeight: "1",
        },
        unit: {
            fontSize: "md",
            lineHeight: "1",
        },
        playerList: {
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

const Root = ({ players, children }: PropsWithChildren<OnlineStatusProps>) => {
    const style = onlineStatusStyle();

    return (
        <OnlineStatusContext.Provider value={{ players }}>
            <div className={style.root}>{children}</div>
        </OnlineStatusContext.Provider>
    );
};

interface CountProps {
    label?: string;
    unit?: string;
}

const Count = ({ label = "オンライン", unit = "人" }: CountProps) => {
    const { players } = useOnlineStatusContext();
    const style = onlineStatusStyle();

    return (
        <div className={style.onlineCount}>
            <div className={style.label}>{label}</div>
            <div className={style.countWrapper}>
                <div className={style.count}>{players.length}</div>
                <div className={style.unit}>{unit}</div>
            </div>
        </div>
    );
};

interface PlayerListProps {
    size?: "sm" | "md" | "lg";
    children?: ReactNode;
}

const PlayerList = ({ size = "md", children }: PlayerListProps) => {
    const { players } = useOnlineStatusContext();
    const style = onlineStatusStyle();

    return (
        <div className={style.playerList}>
            {children ??
                players.map((player) => (
                    <PlayerMap
                        key={player.id}
                        uuid={player.id}
                        name={player.username}
                        size={size}
                    />
                ))}
        </div>
    );
};

// Legacy default export for backward compatibility
export const OnlineStatus = ({ players }: OnlineStatusProps) => {
    const style = onlineStatusStyle();

    return (
        <div className={style.root}>
            <OnlineStatusContext.Provider value={{ players }}>
                <div className={style.onlineCount}>
                    <div className={style.label}>オンライン</div>
                    <div className={style.countWrapper}>
                        <div className={style.count}>{players.length}</div>
                        <div className={style.unit}>人</div>
                    </div>
                </div>
                <div className={style.playerList}>
                    {players.map((player) => (
                        <PlayerMap
                            key={player.id}
                            uuid={player.id}
                            name={player.username}
                            size="md"
                        />
                    ))}
                </div>
            </OnlineStatusContext.Provider>
        </div>
    );
};

// Compound Component exports
OnlineStatus.Root = Root;
OnlineStatus.Count = Count;
OnlineStatus.PlayerList = PlayerList;
