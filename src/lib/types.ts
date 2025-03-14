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

export interface ShopData {
    shopId: number;
    owner: string;
    mode: string;
    stackingAmount: number;
    remaining: number;
    location: {
        world: string;
        x: number;
        y: number;
        z: number;
        yaw: number;
        pitch: number;
    };
    price: number;
    item: {
        type: {
            name: string;
            type: string;
        };
        amount: number;
        lore: Array<{
            text: string;
        }>;
        meta: {
            displayName: {
                text: string;
            };
            enchantment: Record<string, unknown>;
            customModelData: number | null;
        };
    };
}
