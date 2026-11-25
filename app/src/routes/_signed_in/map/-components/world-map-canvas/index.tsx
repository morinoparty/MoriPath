// Leaflet は import 時に window を参照するため、このモジュールはクライアントでだけ lazy import する
import "./leaflet.css";
import L from "leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { css } from "../../../../../../styled-system/css";
import { layerOverlayKeys } from "../../-functions/default-overlays";
import { useMapMarkers } from "../../-functions/use-map-markers";
import { useMapPlayers } from "../../-functions/use-map-players";
import {
    buildTileUrl,
    NATIVE_MAX_ZOOM,
    TILE_SIZE,
    toLatLng,
} from "../../-functions/world-map-coords";
import type {
    MarkerLayer,
    OverlayVisibility,
    SelfPlayer,
    Vec2,
    WorldId,
} from "../../-types/world-map";
import { ClaimPopup } from "../claim-popup";
import { RailwayPopup } from "../railway-popup";
import { createMinecraftCrs } from "./create-minecraft-crs";
import {
    ClaimLayer,
    PinLayer,
    PlayersLayer,
    RailwayLayer,
    type SelectedFeature,
    WorldBorderLayer,
} from "./marker-layers";

// 拡大しすぎるとドットが崩れるだけなので、ネイティブより 2 段階まで
const MAX_ZOOM = NATIVE_MAX_ZOOM + 2;
// 開いたときは 1 ブロック = 1 px で見せる
const DEFAULT_ZOOM = NATIVE_MAX_ZOOM;

const mapStyle = css({
    position: "absolute",
    inset: 0,
    // Leaflet のペイン (z-index 400〜) を地図の中に閉じ込め、上に浮かぶ操作ボタンより下にする
    zIndex: 0,
    // タイルの読み込み前・範囲外は淡い面で埋める
    bg: "colorPalette.bg.subtle",
    // Leaflet の CSS が当てる欧文フォントではなく、アプリの本文と同じ書体で駅名などを描く
    "&.leaflet-container": {
        fontFamily: "inherit",
        fontSize: "inherit",
        lineHeight: "inherit",
    },
    // ドット絵のタイルを拡大してもぼかさない
    "& .leaflet-tile": {
        imageRendering: "pixelated",
    },
    // Leaflet 既定のフォーカス枠は地図全体を囲んでしまうので消す
    "&:focus-visible": {
        outline: "none",
    },
    // ポップアップは中身のカードが面と影を持つので、Leaflet 既定の吹き出しを消す
    "& .leaflet-popup-content-wrapper": {
        bg: "transparent",
        boxShadow: "none",
        borderRadius: "0",
        p: "0",
    },
    "& .leaflet-popup-content": {
        m: "0",
        width: "auto !important",
        fontSize: "inherit",
        lineHeight: "inherit",
    },
    "& .leaflet-popup-tip-container": {
        display: "none",
    },
});

export interface WorldMapCanvasProps {
    /** squaremap の公開 URL (末尾スラッシュなし) */
    baseUrl: string;
    world: WorldId;
    /** 地図の中心にする座標 */
    center: Vec2;
    /** 「マーカー表示」で選ばれている項目 */
    overlays: OverlayVisibility;
    /** ログイン中のプレイヤー。分からなければ null */
    self: SelfPlayer | null;
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

/** ポップアップを区別する key (タップした位置と種類) */
const popupKey = (feature: SelectedFeature) =>
    `${feature.kind}:${feature.position.x},${feature.position.z}`;

/** squaremap のレイヤー 1 つを、種類に応じた描き方で出す */
const MarkerLayerView = ({
    layer,
    onSelect,
}: {
    layer: MarkerLayer;
    onSelect: (feature: SelectedFeature) => void;
}) => {
    switch (layer.id) {
        case "Railway":
            return <RailwayLayer layer={layer} onSelect={onSelect} />;
        case "griefprevention":
            return <ClaimLayer layer={layer} onSelect={onSelect} />;
        case "squaremap-worldborder":
            return <WorldBorderLayer layer={layer} />;
        case "squaremap-spawn_icon":
            return <PinLayer layer={layer} variant="spawn" />;
        case "banners":
            return <PinLayer layer={layer} variant="banner" />;
        default:
            return null;
    }
};

/** squaremap のタイルを Leaflet で表示する地図本体 */
export const WorldMapCanvas = ({
    baseUrl,
    world,
    center,
    overlays,
    self,
}: WorldMapCanvasProps) => {
    // CRS と renderer は地図の生成時にしか渡せないので 1 度だけ作る
    const crs = useMemo(() => createMinecraftCrs(), []);
    // 指でも細い路線をタップできるよう、当たり判定を線の外側まで広げる
    const renderer = useMemo(() => L.canvas({ tolerance: 8 }), []);
    const markers = useMapMarkers(baseUrl, world);
    const players = useMapPlayers(baseUrl, overlays.players);
    // 表示中のワールドにいるプレイヤーだけを出す
    const worldPlayers =
        players.data?.players.filter((player) => player.world === world) ?? [];
    // タップされた路線・保護範囲と、そのワールド。ポップアップは 1 つだけ出す
    const [selection, setSelection] = useState<{
        world: WorldId;
        feature: SelectedFeature;
    } | null>(null);
    const select = useCallback(
        (feature: SelectedFeature) => setSelection({ world, feature }),
        [world],
    );
    // ワールドを切り替えたら、前のワールドのポップアップは出さない
    const selected = selection?.world === world ? selection.feature : null;

    // 選ばれていない項目のレイヤーは描かない (対応の無いレイヤーも出さない)
    const visibleLayers = (markers.data ?? []).filter((layer) => {
        const key = layerOverlayKeys[layer.id];
        return key !== undefined && overlays[key];
    });

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
            renderer={renderer}
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
            {visibleLayers.map((layer) => (
                <MarkerLayerView
                    key={`${world}-${layer.id}`}
                    layer={layer}
                    onSelect={select}
                />
            ))}
            {overlays.players && (
                <PlayersLayer players={worldPlayers} self={self} />
            )}
            {selected && (
                <Popup
                    // 別の図形をタップしたら作り直して、その位置で開き直す
                    key={popupKey(selected)}
                    position={toLatLng(selected.position)}
                    closeButton={false}
                    // 上の操作ボタンと下の TabBar に隠れないよう、余白を取って地図を動かす
                    autoPanPaddingTopLeft={[16, 96]}
                    autoPanPaddingBottomRight={[16, 140]}
                    eventHandlers={{
                        // 閉じたのが今のポップアップのときだけ選択を外す。
                        // 別の図形に切り替えたときも古いポップアップの remove が来るため
                        remove: () => {
                            const closedKey = popupKey(selected);
                            setSelection((current) =>
                                current &&
                                popupKey(current.feature) === closedKey
                                    ? null
                                    : current,
                            );
                        },
                    }}
                >
                    {selected.kind === "railway" ? (
                        <RailwayPopup
                            route={selected.route}
                            lineColor={selected.color}
                        />
                    ) : (
                        <ClaimPopup claim={selected.claim} />
                    )}
                </Popup>
            )}
        </MapContainer>
    );
};

export default WorldMapCanvas;
