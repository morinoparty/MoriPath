import { env } from "cloudflare:workers";
import type { PlayerServerData, ServerPlayerData } from "../types/player";

// カラータグを削除する関数
export const removeColorTags = (text: string): string => {
    // <#RRGGBB>や</#RRGGBB>、<gold>や</gold>などのタグを削除
    return text.replace(/<[/#]?(?:#[0-9a-fA-F]{6}|[a-zA-Z]+)>/g, "");
};

// ユーザー名の検証を行う関数
export const validateUsername = async (
    username: string,
    currentUser: string | undefined,
): Promise<string | null> => {
    if (!username.trim()) {
        return "Minecraft IDを入力してください";
    }

    // 自分自身への送金を防ぐ
    if (currentUser && username.toLowerCase() === currentUser.toLowerCase()) {
        return "自分自身には送金できません";
    }

    try {
        // ユーザーが存在するか確認するAPIを呼び出す
        const response = await fetch(
            `https://api.ashcon.app/mojang/v2/user/${encodeURIComponent(username)}`,
        );

        if (response.status === 404) {
            return "指定されたMinecraft IDのユーザーが見つかりません";
        }

        if (response.status === 200) {
            return null;
        }

        return "ユーザーの検証中にエラーが発生しました";
    } catch (error) {
        console.error("ユーザー検証エラー:", error);
        return "ユーザーの検証中にエラーが発生しました";
    }
};

export async function getPlayerData(uuid: string): Promise<PlayerServerData> {
    const servers = env.SERVERS.split(",");
    for (const server of servers) {
        const response = await fetch(
            `${env.SERVER_URL}${server}/api/v1/commons/server/players`,
            {},
        );
        const players = await response.json<ServerPlayerData[]>();
        const player = players.find((player) => player.id === uuid);
        if (player) {
            const serverName = getServerName(server);
            return { uuid, server: serverName };
        }
    }
    return { uuid, server: "オフライン" };
}

function getServerName(server: string): string {
    switch (server) {
        case "lobby":
            return "ロビーサーバー";
        case "main":
            return "生活サーバー";
        case "res":
            return "資源サーバー";
        default:
            return "オフライン";
    }
}
