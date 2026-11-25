// ポートレートのスキンのポーズ (DOM に触れない純粋関数)
import type { SkinViewerPose } from "@morinoparty/chlorophyll-react/components";
import type { PortraitPose, PortraitPoseId } from "../-types/portrait-pose";

/** ランダムに選ぶ候補 (並び順は Storybook の表示順にも使う) */
export const PORTRAIT_POSE_IDS = [
    "front",
    "diagonal",
    "pickaxe",
    "torch",
] as const satisfies readonly PortraitPoseId[];

/** 右手に持たせるツルハシ (Minecraft のアイテム ID) */
export const PORTRAIT_PICKAXE_ITEM = "diamond_pickaxe";

/** 左手に持たせる松明 (Minecraft のアイテム ID) */
export const PORTRAIT_TORCH_ITEM = "torch";

// 斜めの角度は Figma の /me のポートレートに合わせる (右側面が見え、少し見下ろす)
const DIAGONAL_YAW = -30;
const DIAGONAL_PITCH = 8;

// 斜めの立ち姿で、頭をカメラ側へ少し向けて傾ける
const DIAGONAL_HEAD_TILT: SkinViewerPose = { head: { y: -10, z: 8 } };

// ツルハシを持つ腕と頭の角度 (度)。
// 腕は胸の高さまで軽く上げ、体の側へ少し寄せる。腕と直交して持つツルハシは顔の横で斜め上を向く。
// 頭は見る人の方へ少し向ける
const PICKAXE_HOLD: SkinViewerPose = {
    rightArm: { x: -65, z: 10 },
    head: { y: 8 },
};

// ツルハシを持つときは体を右へずらし、左側の空いた所にツルハシを収める (px)
const PICKAXE_OFFSET_X = 45;

// 松明を掲げる左腕と頭の角度 (度)。
// 腕を水平より少し上げて体の外へ開き、腕と直交して持つ松明を顔の横で上へ向ける (炎の面がカメラに向く)。
// 頭は見る人の方へ少し向ける
const TORCH_HOLD: SkinViewerPose = {
    leftArm: { x: -100, z: 28 },
    head: { y: 8 },
};

// 松明を持つときは体を左へずらし、右側の空いた所に松明を収める (px)
const TORCH_OFFSET_X = -40;

const PORTRAIT_POSES: Record<PortraitPoseId, PortraitPose> = {
    // これまでどおり正面を向いて立つ
    front: { yaw: 0, pitch: 0, animation: "idle" },
    diagonal: {
        yaw: DIAGONAL_YAW,
        pitch: DIAGONAL_PITCH,
        animation: "idle",
        joints: DIAGONAL_HEAD_TILT,
    },
    // 右手にツルハシを持つ。持った腕が顔に重ならないよう、少し左側面寄りから見る。
    // 腕は関節の角度で上げ、スクロールに合わせて少しずつ下ろせるようにする
    pickaxe: {
        yaw: 20,
        pitch: DIAGONAL_PITCH,
        animation: "idle",
        joints: PICKAXE_HOLD,
        rightHandItem: PORTRAIT_PICKAXE_ITEM,
        offsetX: PICKAXE_OFFSET_X,
    },
    // 左手に松明を掲げる。掲げた腕と松明が手前に来るよう左側面寄りから見る
    torch: {
        yaw: 15,
        pitch: DIAGONAL_PITCH,
        animation: "idle",
        joints: TORCH_HOLD,
        leftHandItem: PORTRAIT_TORCH_ITEM,
        offsetX: TORCH_OFFSET_X,
    },
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
 * - 動きを減らす設定では動かさない (アニメーションを止める。関節の角度で作る姿勢はそのまま)
 * - アイテムのアセットを解決できないときは、アイテムを持たずに同じポーズをとる
 */
export const resolvePortraitPose = (
    id: PortraitPoseId,
    {
        reducedMotion,
        canHoldItem,
    }: { reducedMotion: boolean; canHoldItem: boolean },
): PortraitPose => {
    const pose = PORTRAIT_POSES[id];
    return {
        ...pose,
        animation: reducedMotion ? "none" : pose.animation,
        rightHandItem: canHoldItem ? pose.rightHandItem : undefined,
        leftHandItem: canHoldItem ? pose.leftHandItem : undefined,
    };
};
