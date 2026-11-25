/** ダイアリーに登場するプレイヤー (PlayerAvatarGroup の players にそのまま渡せる形) */
export interface DiaryPlayer {
    /** UUID (ハイフン区切り) */
    id: string;
    name: string;
}

/** 「きょうのもりぱダイアリー」の 1 件 */
export interface DiaryEntry {
    id: string;
    /** 出来事の時刻 (ISO 8601、+09:00 付き) */
    time: string;
    /** 出来事の本文 */
    description: string;
    /** その出来事に居合わせたプレイヤー。いなければ空配列 */
    players: DiaryPlayer[];
}
