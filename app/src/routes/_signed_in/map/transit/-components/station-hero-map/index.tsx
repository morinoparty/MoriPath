// Leaflet は import 時に window を参照するため、このモジュールはクライアントでだけ lazy import する
import "../../../-components/world-map-canvas/leaflet.css";
import { MapPin } from "lucide-react";
import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { css, sva } from "../../../../../../../styled-system/css";
import { createMinecraftCrs } from "../../../-components/world-map-canvas/create-minecraft-crs";
import { PortalMarker } from "../../../-components/world-map-canvas/portal-marker";
import {
    buildTileUrl,
    NATIVE_MAX_ZOOM,
    TILE_SIZE,
    toLatLng,
} from "../../../-functions/world-map-coords";
import type { Vec2, WorldId } from "../../../-types/world-map";
import type { TransitStation } from "../../-types/transit";

const mapStyle = css({
    width: "full",
    height: "full",
    // タイルが届くまでは下に敷いたグラデーションを見せる (Leaflet 既定の灰色の面を消す)
    "&.leaflet-container": {
        bg: "transparent",
        fontFamily: "inherit",
        fontSize: "inherit",
        lineHeight: "inherit",
        // 飾りの地図なので、つかむ形のカーソルを出さない
        cursor: "default",
    },
    // /map と同じく、ドット絵のタイルをぼかさず、原色を明るく柔らかくする
    "& .leaflet-tile": {
        imageRendering: "pixelated",
    },
    "& .leaflet-tile-container": {
        filter: "contrast(0.8) brightness(1.2) grayscale(0.15) hue-rotate(-7deg)",
    },
});

// Figma B の駅の目印。ピンの先を駅の座標に合わせ、その下に「〇〇 付近」の札を置く
const stationPinStyle = sva({
    slots: ["root", "pin", "chip"],
    base: {
        // マーカーの大きさは 0 なので、ピンの先 (36px の下端) が座標に来るよう左右中央・上へずらす
        root: {
            position: "absolute",
            top: "0",
            left: "0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5",
            transform: "translate(-50%, -36px)",
            pointerEvents: "none",
        },
        pin: {
            width: "36px",
            height: "36px",
            color: "colorPalette.fg",
            fill: "colorPalette.surface.subtle",
        },
        // 地図の上でも読めるよう、枠と同じ色の半透明の面とぼかしを敷く
        chip: {
            paddingX: "3",
            paddingY: "1",
            borderRadius: "full",
            bg: "color-mix(in srgb, {colors.colorPalette.surface.subtle} 90%, transparent)",
            backdropFilter: "blur(8px)",
            color: "colorPalette.fg",
            fontSize: "14px",
            fontWeight: "bold",
            lineHeight: "1.4",
            whiteSpace: "nowrap",
        },
    },
});

/** 地図の上の駅の目印 (ピンと「〇〇 付近」の札) */
const StationPin = ({ name }: { name: string }) => {
    const style = stationPinStyle();
    return (
        <div className={style.root}>
            <MapPin className={style.pin} aria-hidden />
            <span className={style.chip}>{name} 付近</span>
        </div>
    );
};

/**
 * 駅が変わったら、地図を作り直さずに中心だけ動かす (/map の CenterUpdater と同じ)。
 * 作り直すとタイルを読み直すあいだグラデーションに戻り、駅を選ぶたびにちらつく
 */
const StationCenter = ({ point }: { point: Vec2 }) => {
    const map = useMap();
    const { x, z } = point;
    useEffect(() => {
        // 飾りの地図なので、動かす様子は見せずにすぐ切り替える
        map.setView(toLatLng({ x, z }), NATIVE_MAX_ZOOM, { animate: false });
    }, [map, x, z]);
    return null;
};

export interface StationHeroMapProps {
    /** squaremap の公開 URL (末尾スラッシュなし) */
    baseUrl: string;
    worldId: WorldId;
    station: TransitStation;
}

/**
 * 見出しの背景に敷く、駅を中心にした地図。眺めるだけの飾りなので、
 * ドラッグ・ズーム・キーボード操作はすべて止め、ページのスクロールを奪わない
 */
export const StationHeroMap = ({
    baseUrl,
    worldId,
    station,
}: StationHeroMapProps) => {
    // CRS は地図の生成時にしか渡せないので 1 度だけ作る
    const crs = useMemo(() => createMinecraftCrs(), []);
    return (
        <MapContainer
            // CRS とタイルはワールドごとなので、ワールドが変わったときだけ作り直す (駅の違いは StationCenter で動かす)
            key={worldId}
            className={mapStyle}
            crs={crs}
            center={toLatLng(station.point)}
            // 1 ブロック = 1 px で、駅のまわりの街並みが分かる縮尺にする
            zoom={NATIVE_MAX_ZOOM}
            minZoom={NATIVE_MAX_ZOOM}
            maxZoom={NATIVE_MAX_ZOOM}
            zoomControl={false}
            attributionControl={false}
            dragging={false}
            touchZoom={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            boxZoom={false}
            keyboard={false}
        >
            <TileLayer
                url={buildTileUrl(baseUrl, worldId)}
                tileSize={TILE_SIZE}
                minZoom={0}
                maxZoom={NATIVE_MAX_ZOOM}
                maxNativeZoom={NATIVE_MAX_ZOOM}
                noWrap
            />
            <StationCenter point={station.point} />
            <PortalMarker position={station.point}>
                {/* 見出しに駅名を出さないので、目印の札に駅名を出す (Figma B) */}
                <StationPin name={station.name} />
            </PortalMarker>
        </MapContainer>
    );
};

export default StationHeroMap;
