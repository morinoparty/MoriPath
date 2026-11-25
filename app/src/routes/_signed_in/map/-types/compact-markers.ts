// サーバーで squaremap の markers.json を /map で使う項目だけに詰めた形。
// 元の JSON はオーバーワールドで約 6 MB あり、スマホで読むと重いため、サーバーで変換してから渡す
import type { RailwayRoute, Vec2 } from "./world-map";

/** 線の頂点 [x, z]。数が多いのでオブジェクトではなく組で持つ */
export type PointTuple = [x: number, z: number];

/** 鉄道の路線 (折れ線) 1 本。ポップアップは乗換案内に読み取ってある */
export interface RailwayLine {
    points: PointTuple[];
    /** 路線の色 (squaremap の color、無ければ fillColor) */
    color: string;
    route: RailwayRoute;
}

/** 鉄道の駅 (円) 1 つ。ポップアップは駅名とナンバリングに読み取ってある */
export interface RailwayCircle {
    center: Vec2;
    /** ブロック単位の半径 */
    radius: number;
    /** 駅名。読み取れなければ null (半径の照合には使う) */
    name: string | null;
    /** 「FM06」などの駅ナンバリング */
    numberings: string[];
}

/** ワールドボーダーの枠線 */
export interface BorderLine {
    points: PointTuple[];
    color: string;
}

/** スポーン地点・バナーのピン */
export interface MapPinData {
    point: Vec2;
    /** ツールチップからタグを落とした名前 */
    label: string;
}

/** 地図を開いたときに読む、保護範囲以外のマーカー */
export interface CompactBaseMarkers {
    railwayLines: RailwayLine[];
    railwayCircles: RailwayCircle[];
    /**
     * ナンバリングの記号 (「PAK」など) → 路線の色。
     * AdvanceRailway の API を使えないときに札を路線の色で描くため、squaremap の駅と路線から推定したもの。
     * 推定できなかった記号は入らない。古いキャッシュには無いことがある
     */
    numberingColors?: Record<string, string>;
    worldBorder: BorderLine[];
    spawn: MapPinData[];
    banners: MapPinData[];
}

/**
 * 保護範囲 1 件。
 * [x1, z1, x2, z2, 所有者, 運営の保護なら 1, Permission Trust, Trust, Container Trust, Access Trust]。
 * 名前は CompactClaims.names の番号で持ち、末尾の空の信頼リストは省く
 */
export type CompactClaim = [
    x1: number,
    z1: number,
    x2: number,
    z2: number,
    owner: number,
    isAdmin: 0 | 1,
    permissionTrust?: number[],
    trust?: number[],
    containerTrust?: number[],
    accessTrust?: number[],
];

/** 「エリア保護」を ON にしたときだけ読む保護範囲 */
export interface CompactClaims {
    /** 所有者・信頼されたプレイヤーの名前の辞書 (同じ名前が何千回も出るため) */
    names: string[];
    claims: CompactClaim[];
}
