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
                        lineHeight: "normal",
                        gap: "10px",
                    })}
                >
                    もりのパーティ
                </div>
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
                        {players.length}
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
            </div>
            <div
                className={css({
                    display: "flex",
                    overflowX: "auto",
                    alignItems: "flex-end",
                    gap: "12px",
                })}
            >
                {players.slice(0, 2).map((player) => (
                    <PlayerMap uuid={player.id} key={player.id} />
                ))}
            </div>
        </div>
    );
};
