import type { Vec2, WorldId } from "../../-types/world-map";
import type { Town } from "./town";
import type { TransitStation } from "./transit";

/** 経路の線が通る駅。地図の線路の形 (squaremap の路線) を駅名で引き当てるのに使う */
export interface RouteStop {
    point: Vec2;
    /** 駅名の候補 (API の名前そのままと、読みがなを除いた名前) */
    names: string[];
}

/** 経路の地図に引く 1 本の線 (乗る区間は路線の色、歩く区間は点線) */
export interface RoutePathPart {
    kind: "rail" | "walk";
    /** 路線の色 #RRGGBB。無ければ null (ブランド色で引く) */
    color: string | null;
    /** 通る駅 (順番どおり)。乗る区間は駅と駅の間を線路の形でつなぐ */
    stops: RouteStop[];
}

/**
 * ページの上に敷く見出しの背景。
 * 街の駅なら街の写真、それ以外の駅は地図、地図も出せなければ空のグラデーションとブロックの風景の絵
 */
export type TransitHero =
    | {
          kind: "town";
          town: Town;
          station: TransitStation;
      }
    | {
          kind: "map";
          station: TransitStation;
          /** 駅のあるワールド (/map のタイルのディレクトリ名) */
          worldId: WorldId;
          /** squaremap の公開 URL (末尾スラッシュなし) */
          baseUrl: string;
      }
    | {
          // 出発と到着が決まったら、経路全体が収まる地図を出す
          kind: "route";
          from: TransitStation;
          to: TransitStation;
          worldId: WorldId;
          baseUrl: string;
          /** 経路の線。経路は待たずに Promise で渡すので、届くまでは出発と到着の目印だけを出す */
          path: Promise<RoutePathPart[] | null> | RoutePathPart[] | null;
      }
    | {
          kind: "landscape";
          /** 駅を選んでいなければ null */
          station: TransitStation | null;
      };
