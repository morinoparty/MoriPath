import L from "leaflet";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMap } from "react-leaflet";
import { toLatLng } from "../../-functions/world-map-coords";
import type { Vec2 } from "../../-types/world-map";

export interface PortalMarkerProps {
    position: Vec2;
    children: ReactNode;
    /** 重なったときに上に出す度合い (プレイヤーを駅名より上にするなど) */
    zIndexOffset?: number;
}

/**
 * React の要素をそのまま地図上に置くマーカー。
 * divIcon に HTML 文字列を渡すと React の Context (MinecraftProvider など) が切れるため、
 * 空のアイコンを置いてその要素へ portal する。
 * アイコンの大きさは 0 にし、子要素側で座標に対する位置 (中心・下端など) を決める
 */
export const PortalMarker = ({
    position,
    children,
    zIndexOffset = 0,
}: PortalMarkerProps) => {
    const map = useMap();
    const markerRef = useRef<L.Marker | null>(null);
    const [element, setElement] = useState<HTMLElement | null>(null);

    // マーカーは 1 度だけ作り、座標などは下の effect で更新する
    useEffect(() => {
        const marker = L.marker(toLatLng(position), {
            icon: L.divIcon({ className: "", html: "", iconSize: [0, 0] }),
            // クリックは子要素 (ボタンなど) に任せ、マーカー自体は地図の操作を邪魔しない
            interactive: false,
            keyboard: false,
        }).addTo(map);
        markerRef.current = marker;
        setElement(marker.getElement() ?? null);
        return () => {
            marker.remove();
            markerRef.current = null;
        };
        // position は作成時の初期値だけ使う
        // oxlint-disable-next-line react-hooks/exhaustive-deps -- 座標の更新は setLatLng で行う
    }, [map]);

    // オブジェクトの同一性ではなく座標の値が変わったときだけ動かす
    const { x, z } = position;
    useEffect(() => {
        markerRef.current?.setLatLng(toLatLng({ x, z }));
    }, [x, z]);

    useEffect(() => {
        markerRef.current?.setZIndexOffset(zIndexOffset);
    }, [zIndexOffset]);

    return element ? createPortal(children, element) : null;
};
