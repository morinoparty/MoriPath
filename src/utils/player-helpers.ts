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
