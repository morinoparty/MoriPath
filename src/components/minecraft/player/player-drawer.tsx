import { getPlayerData, uuidToName } from "@/src/utils/player-helpers";
import { randomPhrase } from "@/src/utils/random-phrase";
import { hashToPastelColor } from "~/utils/color";
import { generateHash } from "~/utils/hash";
import { PlayerDrawerContent } from "./player-drawer-content";

const headerHeight = 128;
const iconSize = 72;

export const PlayerDrawer: React.FC<{
  children: React.ReactNode;
  uuid: string;
}> = async ({ children, uuid }) => {
  // サーバーサイドでデータを取得
  const playerName = await uuidToName(uuid);
  // サーバーサイドでしか実行できない関数
  const playerData = await getPlayerData(uuid);
  const randomText = randomPhrase("first", uuid) + randomPhrase("last", uuid);
  const backgroundColor = hashToPastelColor(generateHash(uuid), false);

  return (
    <PlayerDrawerContent
      children={children}
      uuid={uuid}
      playerName={playerName}
      playerServer={playerData.server}
      randomText={randomText}
      backgroundColor={backgroundColor}
      headerHeight={headerHeight}
      iconSize={iconSize}
    />
  );
};
