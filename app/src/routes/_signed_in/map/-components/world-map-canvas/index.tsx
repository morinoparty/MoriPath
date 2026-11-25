// Leaflet は import 時に window を参照するため、このモジュールはクライアントでだけ lazy import する
import "./leaflet.css";
import L from "leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    MapContainer,
    Popup,
    TileLayer,
    useMap,
    useMapEvents,
} from "react-leaflet";
import { css } from "../../../../../../styled-system/css";
import { useBaseMarkers, useClaims } from "../../-functions/map-markers-query";
import { useMapPlayers } from "../../-functions/use-map-players";
import { useStationLines } from "../../-functions/use-station-lines";
import {
    buildTileUrl,
    NATIVE_MAX_ZOOM,
    TILE_SIZE,
    toLatLng,
} from "../../-functions/world-map-coords";
import type { MapPinTarget } from "../../-types/map-pin-target";
import type {
    MapPlayer,
    OverlayVisibility,
    SelfPlayer,
    Vec2,
    WorldId,
} from "../../-types/world-map";
import { ClaimPopup } from "../claim-popup";
import { MapTargetPin } from "../map-target-pin";
import { RailwayPopup } from "../railway-popup";
import { StationPopup } from "../station-popup";
import { ClickShield } from "./click-shield";
import { createMinecraftCrs } from "./create-minecraft-crs";
import {
    ClaimLayer,
    LINE_TAP_TOLERANCE,
    PinLayer,
    PlayersLayer,
    RailwayLayer,
    type SelectedFeature,
    WorldBorderLayer,
} from "./marker-layers";
import { PortalMarker } from "./portal-marker";

// 拡大しすぎるとドットが崩れるだけなので、ネイティブより 2 段階まで
const MAX_ZOOM = NATIVE_MAX_ZOOM + 2;
// 開いたときは 1 ブロック = 1 px で見せる
const DEFAULT_ZOOM = NATIVE_MAX_ZOOM;
// ピンを指して開いたときは 1 ブロック = 2 px まで寄せ、建物やお店の区画が分かるようにする
const PIN_ZOOM = NATIVE_MAX_ZOOM + 1;

const mapStyle = css({
    position: "absolute",
    inset: 0,
    // Leaflet のペイン (z-index 400〜) を地図の中に閉じ込め、上に浮かぶ操作ボタンより下にする
    zIndex: 0,
    // タイルの読み込み前・範囲外は、ワールドごとの色 (world-map-view の --map-void) で埋める
    bg: "var(--map-void, {colors.colorPalette.bg.subtle})",
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
    // タイルの原色は強く、上に重ねる駅名やポップアップが埋もれるため、MoriMap と同じく明るく柔らかくする。
    // MoriMap の mix-blend-mode: luminosity は、Leaflet のペインが重なりの文脈を作るため背景と混ざらず効果がないので使わない
    "& .leaflet-tile-container": {
        filter: "contrast(0.8) brightness(1.2) grayscale(0.15) hue-rotate(-7deg)",
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
    /** URL で指された地点。center はこの地点になっている */
    pin?: (MapPinTarget & { label?: string }) | null;
    /** ピンを外す (閉じるボタン) */
    onClearPin?: () => void;
    /** 追いかけている人。表示中のワールドにいないときや追いかけていないときは null */
    followed?: MapPlayer | null;
    /** 地図をドラッグして、追いかけるのをやめた */
    onFollowCancel?: () => void;
}

/** 中心座標が変わったとき (ワールド切り替え・別のピンなど) に地図を移動させる */
const CenterUpdater = ({
    center,
    zoom,
    paused,
}: {
    center: Vec2;
    zoom: number;
    /** プレイヤーを追いかけているあいだは、そちらに任せて動かさない */
    paused: boolean;
}) => {
    const map = useMap();
    // 最後に合わせた座標。初回は MapContainer の center で表示済み。
    // 座標の値が変わったときだけ動かし、ズームだけが変わったとき (ピンを外したなど) は見ている位置をそのままにする
    const lastCenter = useRef(center);
    const { x, z } = center;
    useEffect(() => {
        if (lastCenter.current.x === x && lastCenter.current.z === z) return;
        lastCenter.current = { x, z };
        // 追いかけているあいだに変わった中心は覚えるだけにし、やめたあとで急に飛ばないようにする
        if (paused) return;
        map.setView(toLatLng({ x, z }), zoom);
    }, [map, x, z, zoom, paused]);
    return null;
};

/**
 * 追いかけているプレイヤーに地図の中心を合わせ続ける (squaremap / LiveAtlas の「フォロー」)。
 * 追い始めたときは寄せてから中心へ飛び、そのあとは位置が届くたびにズームを変えずに動かす。
 * 地図をドラッグ・ズームしたら追いかけるのをやめる
 */
const FollowController = ({
    target,
    onCancel,
}: {
    target: MapPlayer | null;
    onCancel?: () => void;
}) => {
    const map = useMap();
    // いま中心に合わせている人。別の人に替わったら、寄せ直してから中心に置く
    const followingId = useRef<string | null>(null);
    // 追い始めに自分で寄せている最中か。そのときの zoomstart は利用者の操作ではないので無視する
    const isEngaging = useRef(false);
    // 利用者の操作でやめた人。URL から player が外れるまで (画面の移動は非同期) に届いた位置で地図を動かさない
    const cancelledId = useRef<string | null>(null);
    const cancelByUser = () => {
        if (followingId.current === null || isEngaging.current) return;
        cancelledId.current = followingId.current;
        followingId.current = null;
        onCancel?.();
    };
    useMapEvents({
        // panTo ではドラッグもズームも起きないので、ここに来るのは利用者の操作 (ピンチを含む) だけ
        dragstart: cancelByUser,
        zoomstart: cancelByUser,
        // 矢印キーでの移動は dragstart を出さないので、キー入力で見分ける
        keydown: (event) => {
            if (event.originalEvent.key.startsWith("Arrow")) {
                cancelByUser();
            }
        },
    });
    const uuid = target?.uuid ?? null;
    const x = target?.x;
    const z = target?.z;
    useEffect(() => {
        if (uuid === null || x === undefined || z === undefined) {
            followingId.current = null;
            cancelledId.current = null;
            return;
        }
        // やめた人の位置が、URL が変わるまでのあいだに届いても追わない
        if (uuid === cancelledId.current) return;
        const position = toLatLng({ x, z });
        if (followingId.current !== uuid) {
            followingId.current = uuid;
            // 縮小して見ていたら、まわりの建物が分かる縮尺まで寄せる。拡大していればそのままにする
            // animate: false なので zoomstart はこの呼び出しの中で同期的に来る
            isEngaging.current = true;
            map.setView(position, Math.max(map.getZoom(), DEFAULT_ZOOM), {
                animate: false,
            });
            isEngaging.current = false;
            return;
        }
        map.panTo(position);
    }, [map, uuid, x, z]);
    return null;
};

/** 駅のポップアップ。乗り入れている路線は開いたときに API から取る */
const StationPopupContent = ({
    feature,
}: {
    feature: Extract<SelectedFeature, { kind: "station" }>;
}) => {
    const { station, fallbackLines } = feature;
    const lines = useStationLines(station.id);
    // API の結果があればそれを、使えない (null・失敗・ID なし) なら squaremap から求めた一覧を出す
    const resolvedLines =
        station.id !== null && lines.isPending
            ? null
            : (lines.data ?? fallbackLines);
    return (
        <StationPopup
            name={station.name}
            numberings={station.numberings}
            lines={resolvedLines}
        />
    );
};

/** ポップアップを区別する key (タップした位置と種類) */
const popupKey = (feature: SelectedFeature) =>
    `${feature.kind}:${feature.position.x},${feature.position.z}`;

/** squaremap のタイルを Leaflet で表示する地図本体 */
export const WorldMapCanvas = ({
    baseUrl,
    world,
    center,
    overlays,
    self,
    pin = null,
    onClearPin,
    followed = null,
    onFollowCancel,
}: WorldMapCanvasProps) => {
    // CRS と renderer は地図の生成時にしか渡せないので 1 度だけ作る
    const crs = useMemo(() => createMinecraftCrs(), []);
    // 指でも細い路線をタップできるよう、当たり判定を線の外側まで広げる
    const renderer = useMemo(
        () => L.canvas({ tolerance: LINE_TAP_TOLERANCE }),
        [],
    );
    // 保護範囲以外は開いたときに (SSR なら loader で) 取り、保護範囲は表示を ON にしたときだけ取る
    const markers = useBaseMarkers(world);
    const claims = useClaims(world, overlays.claims);
    // 「プレイヤー」を隠していても、追いかけている人の位置は取り続ける
    const players = useMapPlayers(
        baseUrl,
        overlays.players || followed !== null,
    );
    // 表示中のワールドにいるプレイヤーだけを出す。「プレイヤー」を隠しているときは追いかけている人だけを出す
    const worldPlayers =
        players.data?.players.filter(
            (player) =>
                player.world === world &&
                (overlays.players || player.uuid === followed?.uuid),
        ) ?? [];
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

    const base = markers.data;

    return (
        <MapContainer
            className={mapStyle}
            crs={crs}
            center={toLatLng(center)}
            zoom={pin ? PIN_ZOOM : DEFAULT_ZOOM}
            minZoom={0}
            maxZoom={MAX_ZOOM}
            // ズームはピンチ・ホイール・ダブルタップで行い、ボタンは置かない
            zoomControl={false}
            attributionControl={false}
            // 保護範囲など大量の図形を 1 枚の canvas にまとめて描く
            preferCanvas
            renderer={renderer}
        >
            <CenterUpdater
                center={center}
                zoom={pin ? PIN_ZOOM : DEFAULT_ZOOM}
                paused={followed !== null}
            />
            <FollowController target={followed} onCancel={onFollowCancel} />
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
            {/* 選ばれていない項目のレイヤーは描かない。key にワールドを入れ、切り替えたら作り直す */}
            {base && overlays.railway && (
                <RailwayLayer
                    key={`${world}-railway`}
                    lines={base.railwayLines}
                    circles={base.railwayCircles}
                    numberingColors={base.numberingColors}
                    onSelect={select}
                />
            )}
            {claims.data && overlays.claims && (
                <ClaimLayer
                    key={`${world}-claims`}
                    data={claims.data}
                    onSelect={select}
                />
            )}
            {base && overlays.worldBorder && (
                <WorldBorderLayer
                    key={`${world}-border`}
                    lines={base.worldBorder}
                />
            )}
            {base && overlays.spawn && (
                <PinLayer
                    key={`${world}-spawn`}
                    pins={base.spawn}
                    variant="spawn"
                />
            )}
            {base && overlays.banners && (
                <PinLayer
                    key={`${world}-banners`}
                    pins={base.banners}
                    variant="banner"
                />
            )}
            <PlayersLayer
                players={worldPlayers}
                self={self}
                followedId={followed?.uuid ?? null}
            />
            {pin && (
                <PortalMarker
                    position={pin}
                    // 指された地点はプレイヤー (〜2000) よりも上に出す
                    zIndexOffset={3000}
                >
                    <ClickShield>
                        <MapTargetPin
                            type={pin.type}
                            x={pin.x}
                            z={pin.z}
                            label={pin.label}
                            onClear={onClearPin}
                        />
                    </ClickShield>
                </PortalMarker>
            )}
            {selected && (
                <Popup
                    // 別の図形をタップしたら作り直して、その位置で開き直す
                    key={popupKey(selected)}
                    position={toLatLng(selected.position)}
                    closeButton={false}
                    // 駅は中心に置いた札の上に出し、札を隠さない
                    offset={selected.kind === "station" ? [0, -14] : [0, 7]}
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
                    {selected.kind === "railway" && (
                        <RailwayPopup
                            route={selected.route}
                            lineColor={selected.color}
                        />
                    )}
                    {selected.kind === "claim" && (
                        <ClaimPopup claim={selected.claim} />
                    )}
                    {selected.kind === "station" && (
                        <StationPopupContent feature={selected} />
                    )}
                </Popup>
            )}
        </MapContainer>
    );
};

export default WorldMapCanvas;
