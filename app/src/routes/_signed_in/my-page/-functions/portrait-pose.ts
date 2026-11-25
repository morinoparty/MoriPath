// ポートレートのスキンのポーズ (DOM に触れない純粋関数)
import type { SkinViewerPose } from "@morinoparty/chlorophyll-react/components";
import type { PortraitPose, PortraitPoseId } from "../-types/portrait-pose";

/** ポーズの候補 (URL の ?pose= で指定できる値) */
export const PORTRAIT_POSE_IDS = [
    "front",
    "diagonal",
    "pickaxe",
    "torch",
    "wave",
] as const satisfies readonly PortraitPoseId[];

/**
 * ランダムに選ぶときの重み (出やすさの比)。
 * 斜めの立ち姿は動きが少なく地味なので、ほかの 1/3 の確率で出るレアなポーズにする
 */
export const PORTRAIT_POSE_WEIGHTS: Readonly<Record<PortraitPoseId, number>> = {
    front: 3,
    diagonal: 1,
    pickaxe: 3,
    torch: 3,
    wave: 3,
};

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
// 腕をほぼ水平まで上げて体の外へ開き、腕と直交して持つ松明を顔の横で上へ向ける (炎の面がカメラに向く)。
// 頭は見る人の方へ少し向ける
const TORCH_HOLD: SkinViewerPose = {
    leftArm: { x: -85, z: 30 },
    head: { y: 8 },
};

// 細い松明は Minecraft と同じ大きさだと小さく見えるため、握る位置を中心に大きく描く
const TORCH_SCALE = 1.8;

// 松明を持つときは体を左へずらし、右側の空いた所に松明を収める (px)
const TORCH_OFFSET_X = -40;

// 手を振るアニメーションを止めたときの姿勢。左腕を上げて手のひらを見せた形で止める
const WAVE_STILL: SkinViewerPose = { leftArm: { x: -127, z: 15 } };

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
        heldItemScale: TORCH_SCALE,
        offsetX: TORCH_OFFSET_X,
    },
    // 正面を向いて左手を振る。振る腕が体に隠れないよう、カメラは正面から少しだけ見下ろす
    wave: {
        yaw: 0,
        pitch: 4,
        animation: "wave",
        reducedMotionJoints: WAVE_STILL,
    },
};

/** random (0 以上 1 未満) から、PORTRAIT_POSE_WEIGHTS の重みに従ってポーズを 1 つ選ぶ */
export const pickPortraitPose = (
    random: number = Math.random(),
): PortraitPoseId => {
    const total = PORTRAIT_POSE_IDS.reduce(
        (sum, id) => sum + PORTRAIT_POSE_WEIGHTS[id],
        0,
    );
    // 0〜total の目盛りの上で、重みの幅ごとに区切った区間のどれに入るかを探す
    let rest = Math.min(Math.max(random, 0), 1) * total;
    for (const id of PORTRAIT_POSE_IDS) {
        rest -= PORTRAIT_POSE_WEIGHTS[id];
        if (rest < 0) {
            return id;
        }
    }
    // random が 1 以上のときは最後の候補にする
    return PORTRAIT_POSE_IDS[PORTRAIT_POSE_IDS.length - 1];
};

/**
 * ポーズの見た目を求める。
 * - 動きを減らす設定では動かさない (アニメーションを止める。関節の角度で作る姿勢はそのまま)。
 *   アニメーションでしか作れない姿勢 (手を振る) は、代わりの関節の角度で止めた形にする
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
        joints: reducedMotion
            ? (pose.reducedMotionJoints ?? pose.joints)
            : pose.joints,
        rightHandItem: canHoldItem ? pose.rightHandItem : undefined,
        leftHandItem: canHoldItem ? pose.leftHandItem : undefined,
    };
};
