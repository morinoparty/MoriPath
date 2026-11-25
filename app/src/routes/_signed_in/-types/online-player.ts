/** ホームのオンライン一覧に並べるプレイヤー */
export interface OnlinePlayer {
    /** Minecraft の UUID。一覧の中で一意 */
    id: string;
    /** プレイヤー名 (MCID) */
    name: string;
    /** 遊んでいるサーバーの ID */
    server: string;
}

/** オンライン一覧をサーバーごとに分けたまとまり */
export interface OnlinePlayerGroup {
    /** サーバー ID */
    server: string;
    /** 見出しに出すサーバー名 */
    label: string;
    players: OnlinePlayer[];
}
