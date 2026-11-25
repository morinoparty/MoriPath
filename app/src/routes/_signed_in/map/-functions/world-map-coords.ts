import type { Vec2, WorldId } from "../-types/world-map";

// squaremap の最大ズーム (タイルのディレクトリ 3) で 1 ブロック = 1 px になる。
// Leaflet の座標は lat = z、lng = x とし、CRS 側で 1/8 倍して zoom 0 に合わせる
export const NATIVE_MAX_ZOOM = 3;

/** タイル 1 枚の一辺 (px) */
export const TILE_SIZE = 512;

/** Minecraft の座標を Leaflet の [lat, lng] に変換する */
export const toLatLng = ({ x, z }: Vec2): [number, number] => [z, x];

/** Leaflet の [lat, lng] を Minecraft の座標に戻す */
export const fromLatLng = (lat: number, lng: number): Vec2 => ({
    x: Math.round(lng),
    z: Math.round(lat),
});

/** ワールドのタイル URL のテンプレート ({z}/{x}/{y} は Leaflet が埋める) */
export const buildTileUrl = (baseUrl: string, world: WorldId): string =>
    `${baseUrl}/tiles/${world}/{z}/{x}_{y}.png`;

/** ワールドの markers.json の URL */
export const buildMarkersUrl = (baseUrl: string, world: WorldId): string =>
    `${baseUrl}/tiles/${world}/markers.json`;

/** ワールドの settings.json (スポーン地点など) の URL */
export const buildWorldSettingsUrl = (
    baseUrl: string,
    world: WorldId,
): string => `${baseUrl}/tiles/${world}/settings.json`;

/** 全ワールド共通の players.json の URL */
export const buildPlayersUrl = (baseUrl: string): string =>
    `${baseUrl}/tiles/players.json`;

/** UUID の表記ゆれ (ハイフン・大文字) をそろえて比較できるようにする */
export const normalizeUuid = (uuid: string): string =>
    uuid.replace(/-/g, "").toLowerCase();
