import type {
    SkinViewerAnimation,
    SkinViewerPose,
} from "@morinoparty/chlorophyll-react/components";

/** ポートレートのスキンの立ち方。開くたびにどれか 1 つをランダムに選ぶ */
export type PortraitPoseId = "front" | "diagonal" | "pickaxe" | "wave";

/** 1 つのポーズの見た目 (SkinViewer に渡す値) */
export interface PortraitPose {
    /** スクロール前のカメラの水平角 (度)。負の値でプレイヤーの右側面が見える */
    yaw: number;
    /** スクロール前のカメラの垂直角 (度)。正の値で少し見下ろす */
    pitch: number;
    /** 再生するアニメーション */
    animation: SkinViewerAnimation;
    /** アニメーションの上から指定する関節の角度 (度)。スクロールに合わせて直立へ補間する */
    joints?: SkinViewerPose;
    /** 右手に持たせるアイテムの ID。アイテムのアセットを解決できないときは持たせない */
    rightHandItem?: string;
    /** スクロール前にスキンを横へずらす量 (px、正の値で右)。関節の角度と同じ速さで 0 へ戻す */
    offsetX?: number;
}
