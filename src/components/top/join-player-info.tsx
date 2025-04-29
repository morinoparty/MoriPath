import { css } from "@/styled-system/css";
import { PlayerList } from "~/components/top/player-list";
import type { ServerPlayerData } from "~/lib/types";

export const JoinPlayerInfo = async () => {
  const servers = (process.env.SERVERS as string).split(",");
  const players = await Promise.all(
    servers.map((server) =>
      fetch(`${process.env.SERVER_URL}${server}/api/v1/commons/server/players`, {}).then((res) =>
        res.json<ServerPlayerData[]>(),
      ),
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
        px: "16px",
        pt: "24px",
        pb: "16px",
        flexDirection: "column",
        justifyContent: "space-between",
        flexShrink: 0,
        gap: "18px",
        borderRadius: "2xl",
        background: "#ffffff",
      })}
    >
      <div
        className={css({
          display: "flex",
          alignItems: "center",
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
          width: "calc(100% + 32px)",
          marginLeft: "-16px",
          position: "relative",
          "& > div": {
            px: "16px",
            _before: {
              position: "absolute",
              content: '""',
              right: "0",
              top: "0",
              width: "16px",
              height: "100%",
              background: "linear-gradient(-90deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%)",
              zIndex: 1,
            },
          },
        })}
      >
        <PlayerList players={players} />
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
          fontWeight: 400,
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
