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
