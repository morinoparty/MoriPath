import type { OverlayKey, OverlayVisibility } from "../-types/world-map";

/** 「マーカー表示」の初期値。保護範囲は数が多く地図が見づらくなるので最初は隠す */
export const defaultOverlays: OverlayVisibility = {
    railway: true,
    claims: false,
    spawn: true,
    worldBorder: true,
    banners: true,
    players: true,
};

/** 表示項目の名前 (メニューの並び順もこの順) */
export const overlayLabels: Record<OverlayKey, string> = {
    railway: "鉄道",
    claims: "エリア保護",
    spawn: "スポーン",
    worldBorder: "ワールドボーダー",
    banners: "バナー(町の名前)",
    players: "プレイヤー",
};

/** squaremap のレイヤー ID と表示項目の対応。ここに無いレイヤーは表示しない */
export const layerOverlayKeys: Record<string, OverlayKey> = {
    Railway: "railway",
    griefprevention: "claims",
    "squaremap-spawn_icon": "spawn",
    "squaremap-worldborder": "worldBorder",
    banners: "banners",
};
