// スクロールに合わせてポートレートを縮めるアニメーションの計算 (DOM に触れない純粋関数)

/** 画面上の点 (px) */
export interface Point {
    x: number;
    y: number;
}

/** 要素に当てる translate + scale */
export interface FlipTransform {
    x: number;
    y: number;
    scale: number;
}

/** スキン画像の中で顔 (頭の正面) が描かれる位置と大きさ (canvas 内の px) */
export interface SkinHead {
    centerX: number;
    centerY: number;
    size: number;
}

/** 1 フレーム分の見た目 */
export interface PortraitFrame {
    /** 位置・大きさの補間に使う、イージング後の進み具合 (0〜1) */
    eased: number;
    /** スキンの向き (度)。1 回転して正面に戻る */
    yaw: number;
    /** 3D スキンの不透明度 */
    skinOpacity: number;
    /** コンパクトバーの 2D アバターの不透明度 */
    avatarOpacity: number;
    /** コンパクトバーの背景の不透明度 */
    barOpacity: number;
    /** ポートレート下端のグラデーション帯の不透明度 */
    bandOpacity: number;
    /** ポートレートの層にある同じ帯 (バーより奥) のぼかしの不透明度 */
    heroBlurOpacity: number;
    /** ポートレートの層にある同じ帯 (バーより奥) の色の不透明度 */
    heroTintOpacity: number;
    /** オンライン・サーバーのピルの不透明度 */
    badgesOpacity: number;
    /** 大きな名前の不透明度 */
    nameOpacity: number;
    /** コンパクトバーの名前の不透明度 */
    barNameOpacity: number;
    /** 胴体を下から消すマスク (スキン要素の高さに対する割合 0〜1)。start より上は不透明、end より下は透明 */
    bodyMask: BodyMask;
}

/** 縦方向のフェードマスク。start >= 1 ならマスクなし */
export interface BodyMask {
    start: number;
    end: number;
}

/** マスクをかけない状態 */
export const NO_BODY_MASK: BodyMask = { start: 1, end: 1 };

/**
 * 回転して縮むにつれて、胴体を下から透明にしていくマスクを求める。
 * 縮んだスキンの長い胴体が下の本文に重なるため、最後は首 (headBottom) より下を消し、頭だけを残す
 */
export const bodyFadeMask = (progress: number, headBottom: number): BodyMask => {
    // 回転が始まってすぐ消し始め、2D の顔に入れ替わる前に消しきる
    const fade = easeInOutSine(remap(progress, 0.05, 0.75));
    if (fade <= 0) {
        return NO_BODY_MASK;
    }
    // 透明になりきる位置は足元から首の少し下まで上がる。下に行くほど透明になる幅は徐々に狭める
    const start = lerp(1, headBottom, fade);
    const width = lerp(0.35, 0.12, fade);
    return { start, end: start + width };
};

/** BodyMask を CSS の mask-image にする (マスクなしは空文字) */
export const toMaskImage = ({ start, end }: BodyMask): string =>
    start >= 1
        ? ""
        : `linear-gradient(to bottom, #000 ${(start * 100).toFixed(1)}%, transparent ${(end * 100).toFixed(1)}%)`;

export const clamp01 = (value: number): number =>
    Math.min(Math.max(value, 0), 1);

export const lerp = (from: number, to: number, t: number): number =>
    from + (to - from) * t;

/** value が start〜end のどこにあるかを 0〜1 で返す (範囲外は端に丸める) */
export const remap = (value: number, start: number, end: number): number =>
    clamp01((value - start) / (end - start));

/** 動き出しと止まり際をなめらかにするイージング */
export const easeInOutSine = (t: number): number =>
    (1 - Math.cos(Math.PI * clamp01(t))) / 2;

/**
 * スクロール量から進み具合 (0〜1) を求める。
 * start でアニメーションが始まり、start + distance で終わる
 */
export const scrollProgress = ({
    scrollY,
    start,
    distance,
}: {
    scrollY: number;
    start: number;
    distance: number;
}): number => {
    // 距離が 0 以下 (計測前など) なら動かさない
    if (distance <= 0) {
        return 0;
    }
    return clamp01((scrollY - start) / distance);
};

/**
 * FLIP の translate + scale を求める。
 * from は進み具合 0 のときのアンカー (transform-origin) の画面上の位置、to は終わりの位置。
 * 要素はページと一緒にスクロールするため、scrolled (開始後にスクロールした量) を足して打ち消し、
 * 画面上では from から to へまっすぐ移動させる
 */
export const flipTransform = ({
    from,
    to,
    scaleTo,
    scrolled,
    progress,
}: {
    from: Point;
    to: Point;
    scaleTo: number;
    scrolled: number;
    progress: number;
}): FlipTransform => ({
    x: (to.x - from.x) * progress,
    y: (to.y - from.y) * progress + scrolled,
    scale: lerp(1, scaleTo, progress),
});

/** FlipTransform を CSS の transform 文字列にする */
export const toTransform = ({ x, y, scale }: FlipTransform): string =>
    `translate3d(${x}px, ${y}px, 0) scale(${scale})`;

// skinview3d の既定値 (Chlorophyll の SkinViewer は fov / zoom を渡していない)
const SKINVIEW_FOV_DEG = 50;
const SKINVIEW_ZOOM = 0.9;

/**
 * skinview3d のカメラ配置から、canvas の中で顔が描かれる位置と大きさを求める。
 * - カメラ距離は viewer.adjustCameraDistance と同じ式 (4.5 + 16.5 / tan(fov/2) / zoom、10〜256 に丸める)
 * - モデルは高さ 32 の中心が原点にあり、頭 (8×8×8) は y = 8〜16。顔の面は手前 z = +4 にある
 * - pitch 0 (真横から見る) のときの値。正面の顔が 2D アバターの顔と重なる
 */
export const estimateSkinHead = ({
    width,
    height,
    fov = SKINVIEW_FOV_DEG,
    zoom = SKINVIEW_ZOOM,
}: {
    width: number;
    height: number;
    fov?: number;
    zoom?: number;
}): SkinHead => {
    const tanHalfFov = Math.tan((fov * Math.PI) / 180 / 2);
    const distance = Math.min(
        Math.max(4.5 + 16.5 / tanHalfFov / zoom, 10),
        256,
    );
    // 顔の面 (カメラから distance - 4 の距離) での 1 ブロック単位あたりの px
    const pxPerUnit = height / (2 * (distance - 4) * tanHalfFov);
    return {
        centerX: width / 2,
        // 顔の中心は原点から 12 単位上 (画面では上に行くほど y が小さい)
        centerY: height / 2 - 12 * pxPerUnit,
        size: 8 * pxPerUnit,
    };
};

/**
 * 進み具合から 1 フレーム分の見た目を決める。
 * reducedMotion のときは回転と移動をやめ、クロスフェードだけにする
 */
export const portraitFrame = (
    progress: number,
    {
        reducedMotion,
        headBottom = 0.4,
    }: {
        reducedMotion: boolean;
        /** スキン要素の高さに対する、首 (頭の下端) の位置の割合 */
        headBottom?: number;
    },
): PortraitFrame => {
    const p = clamp01(progress);
    // グラデーション帯はバーより手前の層にあるため、バーが出る前に消しておく
    const bandOpacity = 1 - remap(p, 0.25, 0.7);
    // 奥の帯のぼかしは手前の帯が消え始める前に出しきる。半透明のまま重ねると下端が透け、背景の切れ目が見える
    const heroBlurOpacity = remap(p, 0.1, 0.25);
    // 色は手前の帯と足して 1 枚分になるよう入れ替え、重なった区間だけ帯が濃くなるのを防ぐ
    const heroTintOpacity = 1 - bandOpacity;
    // ピルは名前より先に消し、名前だけがバーへ移るようにする
    const badgesOpacity = 1 - remap(p, 0, 0.35);

    if (reducedMotion) {
        // 動かさずに、大きい表示とバーを入れ替える
        const swap = remap(p, 0.5, 0.9);
        return {
            eased: 0,
            yaw: 0,
            skinOpacity: 1 - swap,
            avatarOpacity: swap,
            barOpacity: swap,
            bandOpacity,
            heroBlurOpacity,
            heroTintOpacity,
            badgesOpacity,
            nameOpacity: 1 - remap(p, 0.3, 0.7),
            barNameOpacity: swap,
            // 動かさない設定では体も縮まないため、マスクで消す必要がない
            bodyMask: NO_BODY_MASK,
        };
    }

    const eased = easeInOutSine(p);
    // 最後の 2 割で 3D スキンから 2D の顔へ入れ替える (体がバーの下にはみ出す区間を隠す)
    const swap = remap(p, 0.8, 1);
    return {
        eased,
        // 1 回転して正面 (360° = 0°) で止まる。整数にして無駄な再描画を減らす
        yaw: Math.round(eased * 360),
        skinOpacity: 1 - swap,
        avatarOpacity: swap,
        barOpacity: remap(p, 0.5, 0.85),
        bandOpacity,
        heroBlurOpacity,
        heroTintOpacity,
        badgesOpacity,
        nameOpacity: 1 - remap(p, 0.6, 0.9),
        barNameOpacity: remap(p, 0.7, 1),
        bodyMask: bodyFadeMask(p, headBottom),
    };
};
