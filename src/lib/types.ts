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

export interface MenuData {
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    link: string;
}
