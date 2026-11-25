// squaremap が公開している JSON (players.json / markers.json) の型と、/map 画面の状態の型

/** squaremap のワールド ID。タイルやマーカーのディレクトリ名と一致する */
export const worldIds = [
    "minecraft_overworld",
    "minecraft_the_nether",
    "minecraft_the_end",
] as const;

export type WorldId = (typeof worldIds)[number];

/** Minecraft の水平座標 (squaremap は y ではなく z を使う) */
export interface Vec2 {
    x: number;
    z: number;
}

/** players.json の 1 プレイヤー分 */
export interface MapPlayer {
    uuid: string;
    name: string;
    world: string;
    x: number;
    y: number;
    z: number;
    yaw: number;
    health: number;
    armor: number;
}

/** players.json 全体 */
export interface PlayersSnapshot {
    max: number;
    players: MapPlayer[];
}

/** 「マーカー表示」で切り替えられる表示項目 */
export const overlayKeys = [
    "railway",
    "claims",
    "spawn",
    "worldBorder",
    "banners",
    "players",
] as const;

export type OverlayKey = (typeof overlayKeys)[number];

/** 表示項目ごとの ON / OFF */
export type OverlayVisibility = Record<OverlayKey, boolean>;

/** 鉄道の路線 (折れ線) のポップアップから読み取った乗換案内 */
export interface RailwayRoute {
    lineName: string;
    fromStation: string;
    toStation: string;
    travelTime: string;
    /** 双方向 (<->) か片方向 (->) か。読み取れなければ null */
    direction: "both" | "oneWay" | null;
}

/** GriefPrevention の保護範囲のポップアップから読み取った情報 */
export interface ClaimInfo {
    /** 運営 (Administrator) の保護か */
    isAdmin: boolean;
    owner: string;
    permissionTrust: string[];
    trust: string[];
    containerTrust: string[];
    accessTrust: string[];
}

/** ログイン中のプレイヤー (地図上で自分のマーカーだけ見た目を変える) */
export interface SelfPlayer {
    id: string;
    name: string;
}
