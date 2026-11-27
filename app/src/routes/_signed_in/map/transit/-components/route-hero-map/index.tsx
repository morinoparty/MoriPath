// Leaflet は import 時に window を参照するため、このモジュールはクライアントでだけ lazy import する
import "../../../-components/world-map-canvas/leaflet.css";
import L from "leaflet";
import { Suspense, use, useEffect, useMemo } from "react";
import { MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";
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
import type { RoutePathPart } from "../../-types/transit-hero";

// 経路が収まるよう寄せるときの余白 (px)。上は戻るボタン、下は背景に重なる出発・到着の枠のぶんを空ける
const FIT_PADDING_TOP_LEFT: [number, number] = [40, 96];
const FIT_PADDING_BOTTOM_RIGHT: [number, number] = [40, 156];

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

// 線の色はトークンで決めたいので、Leaflet の属性ではなくクラスで stroke を当てる (CSS が属性より優先される)
const lineStyle = sva({
    slots: ["casing", "rail", "walk"],
    base: {
        // 地図の上でも線が埋もれないよう、下に白い縁を引く
        casing: { stroke: "bg.panel" },
        // 色の無い路線はブランド色で引く
        rail: { stroke: "colorPalette.solid" },
        walk: { stroke: "fg.muted" },
    },
});

// 出発・到着の目印。座標に丸を置き、その上に札を出す
const endpointStyle = sva({
    slots: ["root", "chip", "label", "dot"],
    base: {
        root: {
            position: "absolute",
            top: "0",
            left: "0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1",
            // 丸 (14px) の中心が座標に来るよう、全体を左右中央・下端から 7px 上へずらす
            transform: "translate(-50%, calc(-100% + 7px))",
            pointerEvents: "none",
        },
        chip: {
            display: "flex",
            alignItems: "center",
            gap: "1.5",
            paddingX: "2.5",
            paddingY: "1",
            borderRadius: "full",
            bg: "color-mix(in srgb, {colors.colorPalette.surface.subtle} 90%, transparent)",
            backdropFilter: "blur(8px)",
            color: "colorPalette.fg",
            fontSize: "13px",
            fontWeight: "bold",
            lineHeight: "1.4",
            whiteSpace: "nowrap",
        },
        label: {
            fontSize: "11px",
            color: "fg.muted",
        },
        dot: {
            width: "14px",
            height: "14px",
            borderRadius: "full",
            borderWidth: "3px",
            borderStyle: "solid",
            borderColor: "colorPalette.solid",
            bg: "bg.panel",
        },
    },
});

const Endpoint = ({ label, name }: { label: string; name: string }) => {
    const style = endpointStyle();
    return (
        <div className={style.root}>
            <span className={style.chip}>
                <span className={style.label}>{label}</span>
                {name}
            </span>
            <span className={style.dot} />
        </div>
    );
};

/** 経路 (無ければ出発と到着) がすべて収まるよう、地図の位置と縮尺を合わせる */
const FitRoute = ({ points }: { points: Vec2[] }) => {
    const map = useMap();
    // 座標の並びが変わったときだけ合わせ直す (配列は描くたびに作られるので文字列で比べる)
    const key = points.map(({ x, z }) => `${x},${z}`).join("|");
    useEffect(() => {
        if (points.length === 0) return;
        const bounds = L.latLngBounds(points.map(toLatLng));
        // 飾りの地図なので、動かす様子は見せずにすぐ切り替える
        map.fitBounds(bounds, {
            paddingTopLeft: FIT_PADDING_TOP_LEFT,
            paddingBottomRight: FIT_PADDING_BOTTOM_RIGHT,
            maxZoom: NATIVE_MAX_ZOOM,
            animate: false,
        });
        // points は key と同じ内容なので、key だけで十分
        // oxlint-disable-next-line react-hooks/exhaustive-deps -- 配列の同一性ではなく中身 (key) で合わせ直す
    }, [map, key]);
    return null;
};

/** 経路の線。届いた経路から引き、地図もその線が収まるよう合わせ直す */
const RouteLines = ({
    path,
    endpoints,
}: {
    path: Promise<RoutePathPart[] | null> | RoutePathPart[] | null;
    endpoints: Vec2[];
}) => {
    const parts = path instanceof Promise ? use(path) : path;
    const style = lineStyle();
    const points = parts
        ? [...endpoints, ...parts.flatMap((part) => part.points)]
        : endpoints;
    return (
        <>
            <FitRoute points={points} />
            {parts?.map((part, index) => {
                const positions = part.points.map(toLatLng);
                // 区間は並び替わらず、位置だけで区別できる
                const key = index;
                return part.kind === "walk" ? (
                    <Polyline
                        key={key}
                        positions={positions}
                        pathOptions={{
                            className: style.walk,
                            weight: 4,
                            dashArray: "2 8",
                            lineCap: "round",
                            interactive: false,
                        }}
                    />
                ) : (
                    <Polyline
                        key={key}
                        positions={positions}
                        pathOptions={{
                            className: style.casing,
                            weight: 10,
                            lineCap: "round",
                            lineJoin: "round",
                            interactive: false,
                        }}
                    />
                );
            })}
            {/* 縁の上に色の線を重ねる (縁を先にすべて引き、乗りかえの所で線が縁に切られないようにする) */}
            {parts?.map((part, index) =>
                part.kind === "rail" ? (
                    <Polyline
                        // oxlint-disable-next-line react/no-array-index-key -- 区間の順番は変わらない
                        key={index}
                        positions={part.points.map(toLatLng)}
                        pathOptions={{
                            // 路線の色があればその色、無ければクラスのブランド色で引く
                            ...(part.color
                                ? { color: part.color }
                                : { className: style.rail }),
                            weight: 5,
                            lineCap: "round",
                            lineJoin: "round",
                            interactive: false,
                        }}
                    />
                ) : null,
            )}
        </>
    );
};

export interface RouteHeroMapProps {
    /** squaremap の公開 URL (末尾スラッシュなし) */
    baseUrl: string;
    worldId: WorldId;
    from: TransitStation;
    to: TransitStation;
    path: Promise<RoutePathPart[] | null> | RoutePathPart[] | null;
}

/**
 * 見出しの背景に敷く、経路全体が収まる地図。眺めるだけの飾りなので、
 * ドラッグ・ズーム・キーボード操作はすべて止め、ページのスクロールを奪わない
 */
export const RouteHeroMap = ({
    baseUrl,
    worldId,
    from,
    to,
    path,
}: RouteHeroMapProps) => {
    // CRS は地図の生成時にしか渡せないので 1 度だけ作る
    const crs = useMemo(() => createMinecraftCrs(), []);
    const endpoints = [from.point, to.point];
    return (
        <MapContainer
            // CRS とタイルはワールドごとなので、ワールドが変わったときだけ作り直す
            key={worldId}
            className={mapStyle}
            crs={crs}
            center={toLatLng(from.point)}
            zoom={NATIVE_MAX_ZOOM}
            minZoom={0}
            maxZoom={NATIVE_MAX_ZOOM}
            // 経路の長さに合わせてちょうどよく収まるよう、縮尺を細かく選べるようにする
            zoomSnap={0.25}
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
            {/* 経路が届くまでは出発と到着が収まるように合わせておく */}
            <Suspense fallback={<FitRoute points={endpoints} />}>
                <RouteLines path={path} endpoints={endpoints} />
            </Suspense>
            <PortalMarker position={from.point}>
                <Endpoint label="出発" name={from.name} />
            </PortalMarker>
            <PortalMarker position={to.point} zIndexOffset={1}>
                <Endpoint label="到着" name={to.name} />
            </PortalMarker>
        </MapContainer>
    );
};

export default RouteHeroMap;
