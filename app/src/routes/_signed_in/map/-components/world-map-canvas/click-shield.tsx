import L from "leaflet";
import { type ReactNode, useEffect, useRef } from "react";

/**
 * 地図の上に置いたボタンなどを押したとき、地図の click (路線や保護範囲の当たり判定) や
 * ドラッグが下で動かないよう、Leaflet へのイベントの伝わりを止める。
 * React の stopPropagation は地図の要素に届いたあとで動くため、DOM で止める
 */
export const ClickShield = ({ children }: { children: ReactNode }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (ref.current) L.DomEvent.disableClickPropagation(ref.current);
    }, []);
    return <div ref={ref}>{children}</div>;
};
