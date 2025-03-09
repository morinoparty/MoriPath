import { css } from "@/styled-system/css";
import { PlayerMap } from "~/components/minecraft/player/player-map";

export const PlayerList = ({
    players,
}: { players: { id: string; username: string }[] }) => {
    return (
        <div
            className={css({
                display: "flex",
                overflowX: "auto",
                gap: "12px",
                flexShrink: 0,
                maxWidth: "100%",
                minHeight: "48px",
                whiteSpace: "nowrap",
                alignItems: "center",
            })}
        >
            {players.map((player) => (
                <PlayerMap uuid={player.id} key={player.id} />
            ))}
        </div>
    );
};
