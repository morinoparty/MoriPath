import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getPlayerData } from "../../../../lib/player-helpers";
import { toPlayerPresence } from "./to-player-presence";

// 各サーバーのオンライン一覧は認証なしで取れる公開情報なので、UUID だけを受け取る
const playerPresenceInputSchema = z.object({
    playerId: z.string().min(1),
});

/** プレイヤーがいまどのサーバーにいるかを調べる */
export const getPlayerPresence = createServerFn()
    .validator(playerPresenceInputSchema)
    .handler(async ({ data }) =>
        toPlayerPresence(await getPlayerData(data.playerId)),
    );

export type PlayerPresenceData = Awaited<ReturnType<typeof getPlayerPresence>>;
