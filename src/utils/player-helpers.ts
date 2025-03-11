import type { PlayerData } from "~/lib/types";

export async function nameToUUID(name: string): Promise<string> {
    const requestUrl = `https://playerdb.co/api/player/minecraft/${name}`;
    const res = await fetch(requestUrl);
    const data = await res.json<PlayerData>();
    return data.data.player.id;
}

export async function uuidToName(uuid: string): Promise<string> {
    const requestUrl = `https://playerdb.co/api/player/minecraft/${uuid}`;
    const res = await fetch(requestUrl);
    const data = await res.json<PlayerData>();
    return data.data.player.username;
}

// ユーザー名の検証を行う関数
export const validateUsername = async (username: string, currentUser: string | undefined): Promise<string | null> => {
    if (!username.trim()) {
        return "Minecraft IDを入力してください";
    }

    // 自分自身への送金を防ぐ
    if (currentUser && username.toLowerCase() === currentUser.toLowerCase()) {
        return "自分自身には送金できません";
    }

    try {
        // ユーザーが存在するか確認するAPIを呼び出す
        const response = await fetch(`https://api.ashcon.app/mojang/v2/user/${encodeURIComponent(username)}`);

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
