// ポートレートのスキンのポーズ (DOM に触れない純粋関数)
import type { PortraitPose, PortraitPoseId } from "../-types/portrait-pose";

/** ランダムに選ぶ候補 (並び順は Storybook の表示順にも使う) */
export const PORTRAIT_POSE_IDS: readonly PortraitPoseId[] = [
    "front",
    "diagonal",
    "pickaxe",
    "wave",
];

/** 右手に持たせるツルハシ (Minecraft のアイテム ID) */
export const PORTRAIT_PICKAXE_ITEM = "diamond_pickaxe";

// 斜めの角度は Figma の /me のポートレートに合わせる (右側面が見え、少し見下ろす)
const DIAGONAL_YAW = -30;
const DIAGONAL_PITCH = 8;

const PORTRAIT_POSES: Record<PortraitPoseId, PortraitPose> = {
    // これまでどおり正面を向いて立つ
    front: { yaw: 0, pitch: 0, animation: "idle" },
    diagonal: { yaw: DIAGONAL_YAW, pitch: DIAGONAL_PITCH, animation: "idle" },
    // 右腕を前に掲げてツルハシを持つ。掲げた腕が顔に重ならないよう、左側面寄りから見る
    pickaxe: {
        yaw: 28,
        pitch: DIAGONAL_PITCH,
        animation: "raise",
        rightHandItem: PORTRAIT_PICKAXE_ITEM,
    },
    // 左手を振る。振る腕が手前に来るよう左側面寄りから見る
    wave: { yaw: 25, pitch: 4, animation: "wave" },
};

/** random (0 以上 1 未満) からポーズを 1 つ選ぶ */
export const pickPortraitPose = (
    random: number = Math.random(),
): PortraitPoseId => {
    const index = Math.min(
        Math.floor(random * PORTRAIT_POSE_IDS.length),
        PORTRAIT_POSE_IDS.length - 1,
    );
    return PORTRAIT_POSE_IDS[Math.max(index, 0)];
};

/**
 * ポーズの見た目を求める。
 * - 動きを減らす設定では動かさない (アニメーションを止め、腕を下ろした姿勢にする)。
 *   腕を上げる姿勢はアニメーションでしか作れないため、手を振るポーズは斜めの立ち姿にする
 * - アイテムのアセットを解決できないときは、アイテムを持たずに同じポーズをとる
 */
export const resolvePortraitPose = (
    id: PortraitPoseId,
    {
        reducedMotion,
        canHoldItem,
    }: { reducedMotion: boolean; canHoldItem: boolean },
): PortraitPose => {
    const pose =
        PORTRAIT_POSES[reducedMotion && id === "wave" ? "diagonal" : id];
    return {
        ...pose,
        animation: reducedMotion ? "none" : pose.animation,
        rightHandItem: canHoldItem ? pose.rightHandItem : undefined,
    };
};
