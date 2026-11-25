// AdvanceRailway の駅・路線 (グループ) を /map で扱うための型
import type { Vec2 } from "./world-map";

/** 駅ナンバリング 1 つ分 (路線ごとに付く。乗換駅は複数持つ) */
export interface StationNumbering {
    /** 路線 (グループ) の名前。squaremap からしか分からないときは空文字 */
    lineName: string;
    /** 「FM06」などの番号。路線が接頭辞を持たなければ null */
    code: string | null;
    /** 路線の色 (#RRGGBB)。分からなければ null (ブランド色で表示する) */
    color: string | null;
}

/** 地図に出す駅 */
export interface MapStation {
    /** AdvanceRailway の駅 ID。API を使えず squaremap から作った駅は null */
    id: string | null;
    name: string;
    point: Vec2;
    /** 地図上の駅の大きさ (ブロック単位の半径)。タップの当たり判定に使う */
    radius: number;
    numberings: StationNumbering[];
}

/** 駅に乗り入れている路線 (ポップアップの一覧用) */
export interface StationLine {
    name: string;
    color: string | null;
}

/** API から取った駅 (ワールドは Bukkit のワールド名のまま) */
export interface ApiStation {
    id: string;
    name: string;
    world: string;
    point: Vec2;
    overrideSize: number | null;
    numberings: StationNumbering[];
}
