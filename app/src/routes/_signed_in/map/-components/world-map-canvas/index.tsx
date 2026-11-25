// Leaflet は import 時に window を参照するため、このモジュールはクライアントでだけ lazy import する
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { css } from "../../../../../../styled-system/css";
import {
    buildTileUrl,
    NATIVE_MAX_ZOOM,
    TILE_SIZE,
    toLatLng,
} from "../../-functions/world-map-coords";
import type { Vec2, WorldId } from "../../-types/world-map";
import { createMinecraftCrs } from "./create-minecraft-crs";

// 拡大しすぎるとドットが崩れるだけなので、ネイティブより 2 段階まで
const MAX_ZOOM = NATIVE_MAX_ZOOM + 2;
// 開いたときは 1 ブロック = 1 px で見せる
const DEFAULT_ZOOM = NATIVE_MAX_ZOOM;

const mapStyle = css({
    position: "absolute",
    inset: 0,
    // タイルの読み込み前・範囲外は海に近い淡い面で埋める
    bg: "colorPalette.bg.subtle",
    // ドット絵のタイルを拡大してもぼかさない
    "& .leaflet-tile": {
        imageRendering: "pixelated",
    },
    // Leaflet 既定のフォーカス枠は地図全体を囲んでしまうので消す
    "&:focus-visible": {
        outline: "none",
    },
});

export interface WorldMapCanvasProps {
    /** squaremap の公開 URL (末尾スラッシュなし) */
    baseUrl: string;
    world: WorldId;
    /** 地図の中心にする座標 */
    center: Vec2;
}

/** 中心座標が変わったとき (ワールド切り替えなど) に地図を移動させる */
const CenterUpdater = ({ center }: { center: Vec2 }) => {
    const map = useMap();
    // 初回は MapContainer の center で表示済みなので、変化したときだけ動かす
    const isFirst = useRef(true);
    useEffect(() => {
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }
        map.setView(toLatLng(center), DEFAULT_ZOOM);
    }, [map, center]);
    return null;
};

/** squaremap のタイルを Leaflet で表示する地図本体 */
export const WorldMapCanvas = ({
    baseUrl,
    world,
    center,
}: WorldMapCanvasProps) => {
    // CRS は地図の生成時にしか渡せないので 1 度だけ作る
    const crs = useMemo(() => createMinecraftCrs(), []);

    return (
        <MapContainer
            className={mapStyle}
            crs={crs}
            center={toLatLng(center)}
            zoom={DEFAULT_ZOOM}
            minZoom={0}
            maxZoom={MAX_ZOOM}
            // ズームはピンチ・ホイール・ダブルタップで行い、ボタンは置かない
            zoomControl={false}
            attributionControl={false}
            // 保護範囲など大量の図形を 1 枚の canvas にまとめて描く
            preferCanvas
        >
            <CenterUpdater center={center} />
            <TileLayer
                // ワールドを切り替えたらタイルを作り直す
                key={world}
                url={buildTileUrl(baseUrl, world)}
                tileSize={TILE_SIZE}
                minZoom={0}
                maxZoom={MAX_ZOOM}
                maxNativeZoom={NATIVE_MAX_ZOOM}
                noWrap
            />
        </MapContainer>
    );
};

export default WorldMapCanvas;
