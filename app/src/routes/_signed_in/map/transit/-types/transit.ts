import type { Vec2, WorldId } from "../../-types/world-map";
import type { TownSlug } from "./town";

/** 駅が路線の中で持つ番号 */
export interface TransitNumbering {
    /** 路線 (グループ) の uuid */
    lineId: string;
    /** 「PAK03」。接頭辞の無い路線は null */
    code: string | null;
    /** 路線内の 0 始まりの並び順 */
    position: number;
    /** 路線の色 #RRGGBB (グループに無ければ null) */
    color: string | null;
}

/** 乗換案内で使う駅 */
export interface TransitStation {
    id: string;
    slug: string;
    /** API の名前そのまま (読みがなを含む)。検索とハイライトはこれに対して行う */
    fullName: string;
    /** 読みがなを除いた表示名 (「紅島」) */
    name: string;
    /** 全角かっこの中の読みがな (「べにじま」)。無ければ null */
    reading: string | null;
    /** Bukkit のワールド名 */
    world: string;
    /** /map のワールド ID。対応が無ければ null */
    worldId: WorldId | null;
    point: Vec2;
    /** API の順のまま */
    numberings: TransitNumbering[];
    /** 街の駅 (写真を出す駅) なら街、そうでなければ null */
    town: TownSlug | null;
}

/** 乗換案内で使う路線 (AdvanceRailway のグループ) */
export interface TransitLine {
    id: string;
    slug: string;
    /** 末尾の半角/全角かっこを除いた名前 (「ぱかぱか高速鉄道ぱかぱか高速ライン」) */
    name: string;
    /** かっこの中 (「緑草線」)。無ければ null */
    subName: string | null;
    color: string | null;
    /** ナンバリングの接頭辞 (「PAK」)。無ければ null */
    prefix: string | null;
    /** position 順の駅 ID */
    stationIds: string[];
    /** 通る街の駅の街 (stationIds の順、重複なし) */
    towns: TownSlug[];
}

/** loader から渡す、シリアライズできる形 (Map を含めない) */
export interface TransitNetwork {
    /** fullName の ja 順 */
    stations: TransitStation[];
    /** name の ja 順 */
    lines: TransitLine[];
}

/** 画面で引くための索引 (useMemo で作る。loader では返さない) */
export interface TransitNetworkIndex {
    network: TransitNetwork;
    stationById: ReadonlyMap<string, TransitStation>;
    stationBySlug: ReadonlyMap<string, TransitStation>;
    lineById: ReadonlyMap<string, TransitLine>;
    lineBySlug: ReadonlyMap<string, TransitLine>;
}

/** 出発・到着のどちらの枠か */
export type TransitSlot = "from" | "to";
/** 枠の表示名 */
export type SlotLabel = "出発" | "到着";
/** もう一方の枠に入っている駅 (選べないようにする) */
export interface DisabledStation {
    id: string;
    /** その駅が入っている枠の表示名 */
    label: SlotLabel;
}
/** 駅のえらび方 (路線から / 駅名で) */
export type TransitMode = "line" | "search";

/** 経路の 1 区間。同じ路線 (group) を続けて乗る RAIL の区間はまとめる */
export type RouteSegment =
    | {
          kind: "rail";
          /** group uuid。無所属の区間は null */
          lineId: string | null;
          /** 表示名。lineById の name → leg.line → leg.railwaySlug → 「路線」 の順に決める */
          lineName: string;
          lineSubName: string | null;
          color: string | null;
          prefix: string | null;
          fromId: string;
          /** 索引の station.name を優先し、無ければ leg.fromName */
          fromName: string;
          toId: string;
          toName: string;
          /** 乗る駅から降りる駅までの駅数 (両端を含む = legs 数 + 1) */
          stopCount: number;
          timeSeconds: number;
          /** 乗る駅から降りる駅までの駅 ID (両端を含む) */
          stationIds: string[];
          /** stationIds のうち街の駅の街 (重複なし) */
          towns: TownSlug[];
      }
    | {
          kind: "walk";
          fromId: string | null;
          /** 無ければ 「現在地」 */
          fromName: string;
          toId: string;
          toName: string;
          timeSeconds: number;
      };

/** 画面に出す経路 */
export interface TransitRoute {
    /** 索引に無ければ null */
    from: TransitStation | null;
    to: TransitStation | null;
    fromName: string;
    toName: string;
    totalSeconds: number;
    /** 乗りかえ回数 = rail 区間の数 - 1 (0 未満にしない)。walk は数えない */
    transfers: number;
    segments: RouteSegment[];
}

/** 経路検索の結果。loader が返す */
export type TransitRouteState =
    | { status: "ok"; route: TransitRoute }
    // 404 no_route
    | { status: "noRoute" }
    // 400 same_station、または from === to
    | { status: "sameStation" }
    // 404 station_not_found、または slug が索引に無い
    | { status: "stationNotFound" }
    // 401/403・トークン無し
    | { status: "unavailable" }
    // それ以外の失敗 (再試行ボタンを出す)
    | { status: "error" };

/** 路線一覧の 1 行 */
export interface LineSummary {
    line: TransitLine;
    /** 出発駅を通るか (一覧の上に出し、「出発駅」タグを付ける) */
    passesFrom: boolean;
    /** 始点・終点の駅名 (方面表示「A ⇄ B」用。駅が 1 つなら同じ) */
    firstName: string;
    lastName: string;
}

/** 路線図の 1 行 */
export interface LineStationRow {
    station: TransitStation;
    /** この路線での番号 (無ければ null) */
    code: string | null;
    /** ほかの路線の番号 (乗換。code が null の路線は除く) */
    transfers: TransitNumbering[];
}

/** 検索の当たり */
export interface StationMatch {
    station: TransitStation;
    /** 小さいほど上。0 番号完全一致 / 1 名前・読みの前方一致 / 2 番号の前方一致 / 3 名前の部分一致 / 4 slug の前方一致 */
    score: number;
    /** station.fullName の中で当たった範囲 [start, end) (UTF-16 の index)。名前で当たっていなければ null */
    nameRange: [number, number] | null;
}

/** ログイン中のプレイヤーの位置 */
export interface SelfPosition {
    world: WorldId;
    x: number;
    z: number;
}

/** 現在地から近い駅 */
export interface NearbyStation {
    station: TransitStation;
    /** 水平距離 (ブロック、四捨五入) */
    distance: number;
}
