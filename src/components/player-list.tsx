import { css } from "@/styled-system/css";
import { PlayerMap } from "~/components/minecraft/player/player-map";

export const PlayerList = async () => {
    const servers = (process.env.SERVERS as string).split(",");
    const players = await Promise.all(
        servers.map((server) =>
            fetch(
                `${process.env.SERVER_URL}${server}/api/v1/commons/server/players`,
                {},
            ).then((res) => res.json<{ id: string; username: string }[]>()),
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
        <div
            className={css({
                display: "flex",
                height: "128px",
                padding: "16px",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexShrink: 0,
                gap: "16px",
                border: "0.5px solid var(--colors-border)",
                borderRadius: "2xl",
                background: "#ffffff",
            })}
        >
            <div
                className={css({
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    alignSelf: "stretch",
                })}
            >
                <div
                    className={css({
                        display: "flex",
                        alignItems: "center",
                        fontStyle: "normal",
                        fontWeight: 500,
                        fontSize: "1.2rem",
                        lineHeight: "normal",
                        gap: "10px",
                    })}
                >
                    もりのパーティ
                </div>
                <PlayerCount count={players.length} />
            </div>
            <div
                className={css({
                    display: "flex",
                    overflowX: "auto",
                    gap: "12px",
                    maxWidth: "100%",
                    height: "64px",
                    whiteSpace: "nowrap",
                    alignItems: "center"
                })}
            >
                {players.map((player) => (
                    <div
                        key={player.id}
                        className={css({
                            display: "inline-block",
                            flexShrink: 0,
                        })}
                    >
                        <PlayerMap uuid={player.id} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const PlayerCount = ({ count }: { count: number }) => {
    return (
        <div
            className={css({
                display: "flex",
                alignItems: "baseline",
            })}
        >
            <div
                className={css({
                    fontSize: "36px",
                    fontStyle: "normal",
                    fontWeight: 500,
                    lineHeight: "100% /* 36px */",
                })}
            >
                {count}
            </div>
            <div
                className={css({
                    fontSize: "14px",
                    fontStyle: "normal",
                    fontWeight: 900,
                    lineHeight: "normal",
                })}
            >
                人
            </div>
        </div>
    );
};
