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
    toTransform,
} from "./collapsing-portrait";

// SSR では useLayoutEffect が警告を出すため、サーバーでは useEffect に切り替える
const useIsomorphicLayoutEffect =
    typeof window === "undefined" ? useEffect : useLayoutEffect;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

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
    /** 大きな名前の要素 (useFitText の containerRef と共有するため外から受け取る) */
    nameRef: RefObject<HTMLHeadingElement | null>;
    /** 変わったら測り直す値 (名前のフォントサイズなど) */
    measureKey?: unknown;
}

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
 * - スキンの向き (yaw) だけは SkinViewer の prop で渡すため state で返す (整数の度が変わったときだけ更新)
 * - スクロールは passive で受け、requestAnimationFrame で 1 フレーム 1 回にまとめる
 */
export const useCollapsingPortrait = ({
    skinHead,
    nameRef,
    measureKey,
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
    const reducedMotionRef = useRef(false);
    const frameRef = useRef<number | null>(null);
    const [yaw, setYaw] = useState(0);

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
        const frame = portraitFrame(progress, { reducedMotion });
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
        // 向きが変わったときだけ SkinViewer を再レンダーする
        setYaw((current) => (current === frame.yaw ? current : frame.yaw));
    }, [nameRef]);

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
            // 行の高さの比 = フォントサイズの比 (どちらも line-height 1.05)
            nameScaleTo:
                name.offsetHeight > 0
                    ? barNameRect.height / name.offsetHeight
                    : 1,
        };
        scheduleUpdate();
    }, [skinHead, nameRef, scheduleUpdate]);

    // 名前のフォントサイズなどが変わったら描画前に測り直す (measureKey は依存のためだけに参照する)
    useIsomorphicLayoutEffect(() => {
        measure();
    }, [measure, measureKey]);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) {
            return;
        }
        // 動きを減らす設定を読み、変わったら追従する
        const media = window.matchMedia(REDUCED_MOTION_QUERY);
        const handleMotionChange = () => {
            reducedMotionRef.current = media.matches;
            scheduleUpdate();
        };
        handleMotionChange();
        media.addEventListener("change", handleMotionChange);

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
            media.removeEventListener("change", handleMotionChange);
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
        yaw,
    };
};
