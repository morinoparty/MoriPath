import { css } from "@/styled-system/css";
import { PlayerDrawer } from "~/components/minecraft/player/player-drawer";
import { PlayerMap } from "~/components/minecraft/player/player-map";
import type { ServerPlayerData } from "~/lib/types";

export const PlayerList = ({ players }: { players: ServerPlayerData[] }) => {
  return (
    <div
      className={css({
        display: "flex",
        overflowX: "auto",
        gap: "12px",
        flexShrink: 0,
        maxWidth: "100%",
        whiteSpace: "nowrap",
        alignItems: "center",
      })}
    >
      {players.map((player) => (
        <PlayerDrawer key={player.id} uuid={player.id}>
          <PlayerMap uuid={player.id} />
        </PlayerDrawer>
      ))}
    </div>
  );
};
