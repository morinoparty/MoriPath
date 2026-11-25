import type { PlayerServerData } from "../../../../types/player";
import type { PlayerPresence } from "../-types/my-page";

// getPlayerData は、どのサーバーにもいないときサーバー名の代わりにこの文字列を返す
const OFFLINE_LABEL = "オフライン";

/** getPlayerData の結果を、画面で使うオンライン状況に変換する */
export const toPlayerPresence = (data: PlayerServerData): PlayerPresence =>
    data.server === OFFLINE_LABEL
        ? { online: false, serverName: null }
        : { online: true, serverName: data.server };
