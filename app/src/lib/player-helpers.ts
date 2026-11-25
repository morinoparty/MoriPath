import { z } from "zod";
import type { PlayerServerData, ServerPlayerData } from "../types/player";
import { MINEAUTH_API_TIMEOUT_MS } from "./mineauth-timeout";
import { getMcApiUrl } from "./player-api";
import { findServerLabel } from "./server-labels";
import { getServers, getServerUrl } from "./server-list";

export const removeColorTags = (text: string): string => {
    return text.replace(/<[/#]?(?:#[0-9a-fA-F]{6}|[a-zA-Z]+)>/g, "");
};

// Minecraft の UUID (ハイフンあり・なしの両方を受け付ける)
const UUID_PATTERN =
    /^([0-9a-f]{8})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{12})$/i;

/** UUID をハイフン付きの小文字にそろえる。UUID の形でなければ null */
export const toDashedUuid = (value: string): string | null => {
    const matched = UUID_PATTERN.exec(value.trim());
    return matched ? matched.slice(1).join("-").toLowerCase() : null;
};

// mc-api のプレイヤー情報。UUID と名前の持ち方の違いを吸収して { id, name } にそろえる
const mcApiPlayerSchema = z.union([
    z
        .object({ uuid: z.string(), name: z.string().min(1) })
        .transform((value) => ({ id: value.uuid, name: value.name })),
    z
        .object({ id: z.string(), username: z.string().min(1) })
        .transform((value) => ({ id: value.id, name: value.username })),
    z
        .object({
            data: z.object({
                player: z.object({
                    id: z.string(),
                    username: z.string().min(1),
                }),
            }),
        })
        .transform((value) => ({
            id: value.data.player.id,
            name: value.data.player.username,
        })),
]);

/**
 * mc-api で Minecraft ID (または UUID) からプレイヤーを引く。
 * 見つからなければ null、通信の失敗や想定外の応答は例外にする
 */
export const findPlayer = async (
    nameOrUuid: string,
): Promise<{ id: string; name: string } | null> => {
    const response = await fetch(
        `${getMcApiUrl()}/v1/players/${encodeURIComponent(nameOrUuid)}`,
    );
    if (response.status === 404) {
        return null;
    }
    if (!response.ok) {
        throw new Error(`mc-api status ${response.status}`);
    }
    const player = mcApiPlayerSchema.parse(await response.json());
    // UUID の形で取れないときは送金先にできないため、見つからない扱いにせず例外にする
    const id = toDashedUuid(player.id);
    if (!id) {
        throw new Error("mc-api returned an invalid UUID");
    }
    return { id, name: player.name };
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
            { signal: AbortSignal.timeout(MINEAUTH_API_TIMEOUT_MS) },
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

// 知らないサーバーは従来どおり「オフライン」にする (to-player-presence がこの文字列で判定する)
function getServerName(server: string): string {
    return findServerLabel(server) ?? "オフライン";
}
