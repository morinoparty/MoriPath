import type { WorldId } from "../../-types/world-map";
import type { Town } from "./town";
import type { TransitStation } from "./transit";

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
          kind: "landscape";
          /** 駅を選んでいなければ null */
          station: TransitStation | null;
      };
