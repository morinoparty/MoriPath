import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { fitFontSize } from "./fit-text";

// SSR では useLayoutEffect が警告を出すため、サーバーでは useEffect に切り替える
const useIsomorphicLayoutEffect =
    typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface UseFitTextOptions {
    /** 収めたい文字列。変わったら測り直す */
    text: string;
    /** 収まるときのフォントサイズ (px) */
    baseFontSize?: number;
    /** これより小さくはしない (px) */
    minFontSize?: number;
}

export interface UseFitTextResult<
    TContainer extends HTMLElement,
    TText extends HTMLElement,
> {
    /** 幅の基準にする要素 (ブロック要素) に付ける */
    containerRef: React.RefObject<TContainer | null>;
    /** 文字列を包む要素 (inline-block / nowrap) に付ける */
    textRef: React.RefObject<TText | null>;
    /** textRef の要素に style={{ fontSize }} で当てるサイズ (px) */
    fontSize: number;
}

/**
 * 1 行の文字列を、コンテナの幅に収まるまで縮めるフォントサイズを返す。
 * SSR と初回描画では baseFontSize を返し、マウント後に実測して縮める
 */
export const useFitText = <
    TContainer extends HTMLElement = HTMLElement,
    TText extends HTMLElement = HTMLElement,
>({
    text,
    baseFontSize = 40,
    minFontSize = 22,
}: UseFitTextOptions): UseFitTextResult<TContainer, TText> => {
    const containerRef = useRef<TContainer>(null);
    const textRef = useRef<TText>(null);
    const [fontSize, setFontSize] = useState(baseFontSize);

    const measure = useCallback(() => {
        const container = containerRef.current;
        const textElement = textRef.current;
        if (!container || !textElement) {
            return;
        }
        // いま当たっているサイズで測り、比で既定サイズ換算する (単位に依存しない)
        const measuredFontSize = Number.parseFloat(
            getComputedStyle(textElement).fontSize,
        );
        const next = fitFontSize({
            textWidth: textElement.getBoundingClientRect().width,
            measuredFontSize,
            containerWidth: container.clientWidth,
            baseFontSize,
            minFontSize,
        });
        // 同じ値なら再レンダーしない
        setFontSize((current) => (current === next ? current : next));
    }, [baseFontSize, minFontSize]);

    // 文字列が変わったら描画前に測り直す (text は依存のためだけに参照する)
    useIsomorphicLayoutEffect(() => {
        measure();
    }, [measure, text]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }
        // 画面幅の変化に追従する
        const observer = new ResizeObserver(() => measure());
        observer.observe(container);
        // Web フォントの読み込みで文字幅が変わるため、読み込み後にも測り直す
        let cancelled = false;
        document.fonts?.ready.then(() => {
            if (!cancelled) {
                measure();
            }
        });
        return () => {
            cancelled = true;
            observer.disconnect();
        };
    }, [measure]);

    return { containerRef, textRef, fontSize };
};
