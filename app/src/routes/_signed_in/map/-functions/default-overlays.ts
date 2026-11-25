import type { OverlayKey, OverlayVisibility } from "../-types/world-map";

/** 「マーカー表示」の初期値。保護範囲は数が多く、バナーは駅名と重なって地図が見づらくなるので最初は隠す */
export const defaultOverlays: OverlayVisibility = {
    railway: true,
    claims: false,
    spawn: true,
    worldBorder: true,
    banners: false,
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
