import type { PlayerServerData, ServerPlayerData } from "../types/player";
import { getMcApiUrl } from "./player-api";
import { getServers, getServerUrl } from "./server-list";

export const removeColorTags = (text: string): string => {
    return text.replace(/<[/#]?(?:#[0-9a-fA-F]{6}|[a-zA-Z]+)>/g, "");
};

export const validateUsername = async (
    username: string,
    currentUser: string | undefined,
): Promise<string | null> => {
    if (!username.trim()) {
        return "Minecraft IDを入力してください";
    }

    if (currentUser && username.toLowerCase() === currentUser.toLowerCase()) {
        return "自分自身には送金できません";
    }

    try {
        // もりのパーティに参加したことがあるプレイヤーかを確認する
        const response = await fetch(
            `${getMcApiUrl()}/v1/players/${encodeURIComponent(username)}`,
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
    const servers = await getServers();
    for (const server of servers) {
        const response = await fetch(
            `${getServerUrl(server)}/api/v1/commons/server/players`,
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
