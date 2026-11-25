import {
    type RefObject,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import {
    flipTransform,
    type Point,
    portraitFrame,
    scrollProgress,
    type SkinHead,
    toMaskImage,
    toTransform,
} from "./collapsing-portrait";

// SSR では useLayoutEffect が警告を出すため、サーバーでは useEffect に切り替える
const useIsomorphicLayoutEffect =
    typeof window === "undefined" ? useEffect : useLayoutEffect;

/** 計測した位置。リサイズとフォント読み込みのときだけ測り直す */
interface PortraitGeometry {
    /** アニメーションが始まるスクロール量 (ポートレート上端の文書内の位置) */
    start: number;
    /** アニメーションに使うスクロール量 (ポートレートの高さ - バーの高さ) */
    distance: number;
    /** スキンの顔の中心 (進み具合 0 のときの画面上の位置) → バーのアバターの中心 */
    skinFrom: Point;
    skinTo: Point;
    skinScaleTo: number;
    /** 大きな名前の左上 → バーの名前の左上 */
    nameFrom: Point;
    nameTo: Point;
    nameScaleTo: number;
}

export interface UseCollapsingPortraitOptions {
    /** canvas の中の顔の位置と大きさ (transform-origin とスケールの基準) */
    skinHead: SkinHead;
    /** スキン要素の高さ (px)。胴体を下から消すマスクの位置を割合にするのに使う */
    skinHeight: number;
    /** 大きな名前の要素 (useFitText の containerRef と共有するため外から受け取る) */
    nameRef: RefObject<HTMLHeadingElement | null>;
    /** 変わったら測り直す値 (名前のフォントサイズなど) */
    measureKey?: unknown;
    /** 動きを減らす設定 (usePrefersReducedMotion)。回転と移動をやめ、クロスフェードだけにする */
    reducedMotion: boolean;
    /** ポーズの向き (度)。スクロールするとここから 1 回転して正面に戻る */
    startYaw?: number;
    /** ポーズのカメラの垂直角 (度)。スクロールすると 0 へ戻る */
    startPitch?: number;
}

/** SkinViewer に渡す向きとポーズ。変わったときだけ再レンダーする */
export interface PortraitSkinView {
    yaw: number;
    pitch: number;
    /** ポーズの強さ (1 でポーズのまま、0 で腕を下ろした直立) */
    poseWeight: number;
}

const isSameView = (a: PortraitSkinView, b: PortraitSkinView): boolean =>
    a.yaw === b.yaw && a.pitch === b.pitch && a.poseWeight === b.poseWeight;

/**
 * root から見た要素の位置を、transform を無視したレイアウト上の値で求める。
 * アニメーション中の要素を測っても、動かす前の位置が得られる
 */
const offsetWithin = (element: HTMLElement, root: HTMLElement): Point => {
    let x = 0;
    let y = 0;
    let current: Element | null = element;
    // offsetParent をたどって root (position: relative) まで足し合わせる
    while (current instanceof HTMLElement && current !== root) {
        x += current.offsetLeft;
        y += current.offsetTop;
        current = current.offsetParent;
    }
    return { x, y };
};

/**
 * スクロールに合わせて、ポートレートの 3D スキンと名前をコンパクトバーへ移す。
 * - 位置と大きさは ref の要素へ style.transform / opacity を直接書き込み、React の再レンダーを起こさない
 * - スキンの向き (yaw / pitch) とポーズは SkinViewer の prop で渡すため state で返す (整数の度が変わったときだけ更新)
 * - スクロールは passive で受け、requestAnimationFrame で 1 フレーム 1 回にまとめる
 */
/** to の文字サイズ ÷ from の文字サイズ (測れないときは 1) */
const fontSizeRatio = (to: HTMLElement, from: HTMLElement): number => {
    const toSize = Number.parseFloat(getComputedStyle(to).fontSize);
    const fromSize = Number.parseFloat(getComputedStyle(from).fontSize);
    return toSize > 0 && fromSize > 0 ? toSize / fromSize : 1;
};

export const useCollapsingPortrait = ({
    skinHead,
    skinHeight,
    nameRef,
    measureKey,
    reducedMotion,
    startYaw = 0,
    startPitch = 0,
}: UseCollapsingPortraitOptions) => {
    // ポートレート全体 (position: relative)。ここを基準に位置を測る
    const rootRef = useRef<HTMLDivElement>(null);
    // 流れの中にあるポートレート (高さがアニメーションの距離になる)
    const heroRef = useRef<HTMLDivElement>(null);
    // 動かす要素
    const skinRef = useRef<HTMLDivElement>(null);
    const badgesRef = useRef<HTMLDivElement>(null);
    const bandRef = useRef<HTMLDivElement>(null);
    // バーより奥にある同じ帯。ぼかしは手前の帯が消え始める前に出しきり、ポートレート下端の切れ目を見せない
    const heroBlurRef = useRef<HTMLDivElement>(null);
    // 奥の帯の色。手前の帯の色と入れ替えて、重ねても 1 枚分の濃さに保つ
    const heroTintRef = useRef<HTMLDivElement>(null);
    // コンパクトバー
    const barRef = useRef<HTMLDivElement>(null);
    const barBackgroundRef = useRef<HTMLDivElement>(null);
    const barAvatarRef = useRef<HTMLDivElement>(null);
    const barNameRef = useRef<HTMLSpanElement>(null);
    const barDotRef = useRef<HTMLSpanElement>(null);

    const geometryRef = useRef<PortraitGeometry | null>(null);
    // 動きを減らす設定とポーズの向きは、update から最新の値を読む (update を作り直さない)
    const reducedMotionRef = useRef(reducedMotion);
    const startAngleRef = useRef({ yaw: startYaw, pitch: startPitch });
    const frameRef = useRef<number | null>(null);
    const [skinView, setSkinView] = useState<PortraitSkinView>({
        yaw: startYaw,
        pitch: startPitch,
        poseWeight: 1,
    });

    // 現在のスクロール量から見た目を計算して書き込む
    const update = useCallback(() => {
        frameRef.current = null;
        const geometry = geometryRef.current;
        if (!geometry) {
            return;
        }
        const reducedMotion = reducedMotionRef.current;
        const progress = scrollProgress({
            scrollY: window.scrollY,
            start: geometry.start,
            distance: geometry.distance,
        });
        const frame = portraitFrame(progress, {
            reducedMotion,
            // 首の位置 = 顔の中心 + 顔の半分
            headBottom: (skinHead.centerY + skinHead.size / 2) / skinHeight,
            startYaw: startAngleRef.current.yaw,
            startPitch: startAngleRef.current.pitch,
        });
        // 開始前は 0、終わった後も足し続けてバーの位置に留める
        const scrolled = Math.max(0, window.scrollY - geometry.start);

        const skin = skinRef.current;
        if (skin) {
            // 動きを減らす設定では位置を変えず、ページと一緒に流す
            skin.style.transform = reducedMotion
                ? ""
                : toTransform(
                      flipTransform({
                          from: geometry.skinFrom,
                          to: geometry.skinTo,
                          scaleTo: geometry.skinScaleTo,
                          scrolled,
                          progress: frame.eased,
                      }),
                  );
            skin.style.opacity = String(frame.skinOpacity);
            // 下に行くほど透明にして、縮んだ胴体が本文に重ならないようにする
            const mask = toMaskImage(frame.bodyMask);
            skin.style.maskImage = mask;
            skin.style.setProperty("-webkit-mask-image", mask);
        }
        const name = nameRef.current;
        if (name) {
            name.style.transform = reducedMotion
                ? ""
                : toTransform(
                      flipTransform({
                          from: geometry.nameFrom,
                          to: geometry.nameTo,
                          scaleTo: geometry.nameScaleTo,
                          scrolled,
                          progress: frame.eased,
                      }),
                  );
            name.style.opacity = String(frame.nameOpacity);
        }
        // 残りは不透明度だけを変える
        const opacities: [HTMLElement | null, number][] = [
            [badgesRef.current, frame.badgesOpacity],
            [bandRef.current, frame.bandOpacity],
            [heroBlurRef.current, frame.heroBlurOpacity],
            [heroTintRef.current, frame.heroTintOpacity],
            [barBackgroundRef.current, frame.barOpacity],
            [barAvatarRef.current, frame.avatarOpacity],
            [barNameRef.current, frame.barNameOpacity],
            [barDotRef.current, frame.barNameOpacity],
        ];
        for (const [element, opacity] of opacities) {
            if (element) {
                element.style.opacity = String(opacity);
            }
        }
        // 向きかポーズが変わったときだけ SkinViewer を再レンダーする
        const next: PortraitSkinView = {
            yaw: frame.yaw,
            pitch: frame.pitch,
            poseWeight: frame.poseWeight,
        };
        setSkinView((current) => (isSameView(current, next) ? current : next));
    }, [nameRef, skinHead, skinHeight]);

    // 次のフレームで 1 回だけ update する
    const scheduleUpdate = useCallback(() => {
        if (frameRef.current === null) {
            frameRef.current = requestAnimationFrame(update);
        }
    }, [update]);

    // 位置を測る。getBoundingClientRect は transform 込みなので、動かす要素は offset 系で測る
    const measure = useCallback(() => {
        const root = rootRef.current;
        const hero = heroRef.current;
        const skin = skinRef.current;
        const name = nameRef.current;
        const bar = barRef.current;
        const barAvatar = barAvatarRef.current;
        const barName = barNameRef.current;
        if (
            !root ||
            !hero ||
            !skin ||
            !name ||
            !bar ||
            !barAvatar ||
            !barName
        ) {
            return;
        }
        const rootRect = root.getBoundingClientRect();
        // 文書内でのポートレート上端。ここまでスクロールしたら動き始める
        const start = rootRect.top + window.scrollY;
        // 進み具合 0 のときの画面上の位置 = root の左端・上端 + root 内の位置
        const skinOffset = offsetWithin(skin, root);
        const nameOffset = offsetWithin(name, root);
        // バーは position: fixed なので、画面上の位置がそのまま終点になる
        const avatarRect = barAvatar.getBoundingClientRect();
        const barNameRect = barName.getBoundingClientRect();

        geometryRef.current = {
            start,
            distance: hero.offsetHeight - bar.offsetHeight,
            skinFrom: {
                x: rootRect.left + skinOffset.x + skinHead.centerX,
                y: skinOffset.y + skinHead.centerY,
            },
            skinTo: {
                x: avatarRect.left + avatarRect.width / 2,
                y: avatarRect.top + avatarRect.height / 2,
            },
            skinScaleTo: avatarRect.width / skinHead.size,
            nameFrom: {
                x: rootRect.left + nameOffset.x,
                y: nameOffset.y,
            },
            nameTo: { x: barNameRect.left, y: barNameRect.top },
            // 文字の大きさの比で縮める。箱の高さの比だと行の高さや余白の差で着地点がずれ、
            // 入れ替えの瞬間に名前が跳ねて見えるため
            nameScaleTo: fontSizeRatio(barName, name),
        };
        scheduleUpdate();
    }, [skinHead, nameRef, scheduleUpdate]);

    // 名前のフォントサイズなどが変わったら描画前に測り直す (measureKey は依存のためだけに参照する)
    useIsomorphicLayoutEffect(() => {
        measure();
    }, [measure, measureKey]);

    // ポーズや動きを減らす設定が変わったら、描画前に ref へ移して描き直す
    useIsomorphicLayoutEffect(() => {
        reducedMotionRef.current = reducedMotion;
        startAngleRef.current = { yaw: startYaw, pitch: startPitch };
        scheduleUpdate();
    }, [reducedMotion, startYaw, startPitch, scheduleUpdate]);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) {
            return;
        }

        // 画面幅やポートレートの大きさが変わったら測り直す
        const observer = new ResizeObserver(() => measure());
        observer.observe(root);
        window.addEventListener("resize", measure);
        window.addEventListener("scroll", scheduleUpdate, { passive: true });
        // Web フォントの読み込みで名前の幅が変わるため、読み込み後にも測り直す
        let cancelled = false;
        document.fonts?.ready.then(() => {
            if (!cancelled) {
                measure();
            }
        });

        return () => {
            cancelled = true;
            observer.disconnect();
            window.removeEventListener("resize", measure);
            window.removeEventListener("scroll", scheduleUpdate);
            if (frameRef.current !== null) {
                cancelAnimationFrame(frameRef.current);
                frameRef.current = null;
            }
        };
    }, [measure, scheduleUpdate]);

    return {
        rootRef,
        heroRef,
        skinRef,
        badgesRef,
        bandRef,
        heroBlurRef,
        heroTintRef,
        barRef,
        barBackgroundRef,
        barAvatarRef,
        barNameRef,
        barDotRef,
        skinView,
    };
};
