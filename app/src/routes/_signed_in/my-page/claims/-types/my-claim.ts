import type { WorldId } from "../../../map/-types/world-map";

/** 画面に出す保護範囲 1 件 */
export interface MyClaim {
    id: number;
    /** サーバー上のワールド名 (例: "world") */
    world: string;
    /** /map のワールド ID。対応するワールドが無ければ null */
    worldId: WorldId | null;
    /** 中心のブロック座標。/map を開く位置に使う */
    center: { x: number; z: number };
    /** 東西の幅 (ブロック) */
    width: number;
    /** 南北の奥行き (ブロック) */
    depth: number;
    /** 面積 (ブロック) */
    area: number;
}

/** 保護した土地の画面のデータ */
export interface MyClaimsPageData {
    /** 使える保護ブロック */
    remainingClaimBlocks: number;
    /** 保護している土地 (大きい順) */
    claims: MyClaim[];
}
