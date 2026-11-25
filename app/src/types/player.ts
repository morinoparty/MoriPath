import type React from "react";

export interface PlayerData {
    data: {
        player: {
            meta: {
                cached_at: number;
            };
            username: string;
            id: string;
            raw_id: string;
            avatar: string;
            skin_texture: string;
            properties: Array<{
                name: string;
                value: string;
                signature: string;
            }>;
            name_history: Array<unknown>;
        };
        success: boolean;
        code: string;
        message: string;
    };
}

export interface ServerPlayerData {
    id: string;
    username: string;
}

/** いまオンラインのプレイヤーと、どのサーバーで遊んでいるか */
export interface OnlineServerPlayerData extends ServerPlayerData {
    /** サーバー ID (`${SERVER_URL}servers` が返す名前) */
    server: string;
}

export interface MenuData {
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    link: string;
}

export interface PlayerServerData {
    uuid: string;
    server: string;
}

// `/oauth2/userinfo` のレスポンス
export interface UserInfoData {
    sub: string; // uuid
    picture: string;
    preferred_username: string; // 通常MCIDと同一
    email: string; // noreplyメールアドレス
    email_verified: boolean;
    roles: string[];
}
