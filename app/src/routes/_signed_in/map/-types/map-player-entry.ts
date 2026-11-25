import type { WorldId } from "./world-map";

/** 「プレイヤー」一覧の 1 人分。地図で追える人と、地図に出ていない人を分ける */
export type MapPlayerEntry =
    | {
          status: "onMap";
          /** Minecraft の UUID */
          id: string;
          name: string;
          /** いまいるワールド */
          world: WorldId;
      }
    | {
          status: "offMap";
          id: string;
          name: string;
          /** 地図に出ていない理由 (いるサーバーなど)。一覧の 2 行目に出す */
          reason: string;
      };

/** 一覧の見出しごとのまとまり (ワールドごと・地図に出ていない人) */
export interface MapPlayerEntryGroup {
    /** React の key にも使う識別子 */
    key: string;
    label: string;
    entries: MapPlayerEntry[];
}
