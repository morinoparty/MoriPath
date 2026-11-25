// サーバー ID (`${SERVER_URL}servers` が返す名前) と画面に出す名前の対応。
// server-list.ts は cloudflare:workers に依存してクライアントから読めないため、表示名だけをここに分ける

/** 名前の分かっているサーバー。並び順は画面に並べる順 */
const KNOWN_SERVERS = [
    { id: "lobby", label: "ロビーサーバー" },
    { id: "main", label: "メインサーバー" },
    { id: "res", label: "資源サーバー" },
] as const;

/** 名前の分かっているサーバーの表示名。分からない ID は null */
export const findServerLabel = (serverId: string): string | null =>
    KNOWN_SERVERS.find((server) => server.id === serverId)?.label ?? null;

/** サーバーの表示名。知らないサーバーは ID をそのまま名前にする */
export const getServerLabel = (serverId: string): string =>
    findServerLabel(serverId) ?? serverId;

/** 並べる順の番号。知らないサーバーは既知のサーバーのあとに回す */
export const getServerOrder = (serverId: string): number => {
    const index = KNOWN_SERVERS.findIndex((server) => server.id === serverId);
    return index === -1 ? KNOWN_SERVERS.length : index;
};
