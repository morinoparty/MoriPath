import { useEffect, useLayoutEffect, useState } from "react";

// SSR では useLayoutEffect が警告を出すため、サーバーでは useEffect に切り替える
const useIsomorphicLayoutEffect =
    typeof window === "undefined" ? useEffect : useLayoutEffect;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * 動きを減らす設定 (prefers-reduced-motion) を返し、変わったら追従する。
 * サーバーでは false とし、描画前に読み直して最初のフレームからアニメーションを止める
 */
export const usePrefersReducedMotion = (): boolean => {
    const [reducedMotion, setReducedMotion] = useState(false);
    useIsomorphicLayoutEffect(() => {
        const media = window.matchMedia(REDUCED_MOTION_QUERY);
        const handleChange = () => setReducedMotion(media.matches);
        handleChange();
        media.addEventListener("change", handleChange);
        return () => media.removeEventListener("change", handleChange);
    }, []);
    return reducedMotion;
};
