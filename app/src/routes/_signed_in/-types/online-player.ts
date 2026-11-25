/** ホームのオンライン一覧に並べるプレイヤー */
export interface OnlinePlayer {
    /** Minecraft の UUID。一覧の中で一意 */
    id: string;
    /** プレイヤー名 (MCID) */
    name: string;
}
