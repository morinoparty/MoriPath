import L from "leaflet";
import { Flag } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Polyline, useMap, useMapEvents } from "react-leaflet";
import { token } from "../../../../../../styled-system/tokens";
import {
    buildMapStations,
    findLinesAtStation,
} from "../../-functions/build-map-stations";
import { clusterMapPlayers } from "../../-functions/cluster-map-players";
import { hitTestStation } from "../../-functions/station-hit-test";
import { toClaimInfo } from "../../-functions/to-claim-info";
import { useRailwayNetwork } from "../../-functions/use-railway-network";
import {
    fromLatLng,
    NATIVE_MAX_ZOOM,
    normalizeUuid,
    toLatLng,
} from "../../-functions/world-map-coords";
import type {
    BorderLine,
    CompactClaims,
    MapPinData,
    PointTuple,
    RailwayCircle,
    RailwayLine,
} from "../../-types/compact-markers";
import type { MapStation, StationLine } from "../../-types/station";
import type {
    ClaimInfo,
    MapPlayer,
    RailwayRoute,
    SelfPlayer,
    Vec2,
} from "../../-types/world-map";
import { MapPin } from "../map-pin";
import { PlayerClusterMarker } from "../player-cluster-marker";
import { PlayerMarker } from "../player-marker";
import {
    stationFootprint,
    StationMarker,
    type StationMarkerDetail,
} from "../station-marker";
import { PortalMarker } from "./portal-marker";

/** タップされた図形と、ポップアップを出す位置 */
export type SelectedFeature =
    | { kind: "railway"; position: Vec2; route: RailwayRoute; color: string }
    | { kind: "claim"; position: Vec2; claim: ClaimInfo }
    | {
          kind: "station";
          position: Vec2;
          station: MapStation;
          /** API で路線を取れないときに使う、squaremap の路線から求めた一覧 */
          fallbackLines: StationLine[];
      };

type SelectHandler = (feature: SelectedFeature) => void;

// 路線の線の太さ (px)
const RAILWAY_LINE_WEIGHT = 5;
// 指でも細い線をタップできるよう、線の外側でもタップを拾う距離 (px)。canvas の renderer に渡す
export const LINE_TAP_TOLERANCE = 8;

/** 線の頂点 [x, z] を Leaflet の [lat, lng] にする */
const tupleToLatLng = ([x, z]: PointTuple): [number, number] => [z, x];

/** 線の React の key。squaremap のマーカーには ID が無いため、端点と頂点数から作る (上り・下りは端点が逆になる) */
const lineKey = (points: PointTuple[]) =>
    `${points[0]?.join(",")}:${points[points.length - 1]?.join(",")}:${points.length}`;

/** 縮尺ごとの駅の見せ方。縮小すると札や駅名が重なって読めないため点にする */
const stationDetailAt = (zoom: number): StationMarkerDetail => {
    if (zoom <= 0) {
        return "dot";
    }
    return zoom === 1 ? "badges" : "full";
};

/** 現在のズームを React の state として持つ */
const useZoom = () => {
    const map = useMap();
    const [zoom, setZoom] = useState(() => map.getZoom());
    useMapEvents({ zoomend: () => setZoom(map.getZoom()) });
    return zoom;
};

/**
 * CSS 変数で定義されたトークンを、canvas に渡せる実際の色に解決する。
 * canvas は var() を解釈できないため、一度要素に当てて計算済みの色を読む
 */
const useResolvedColor = (cssValue: string) => {
    const map = useMap();
    return useMemo(() => {
        const probe = document.createElement("span");
        probe.style.color = cssValue;
        map.getContainer().appendChild(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        return color;
    }, [map, cssValue]);
};

/**
 * 駅 1 つ分の札・点。指やマウスでは押せず (地図のドラッグを邪魔しない)、
 * キーボード・スクリーンリーダーからだけボタンとして選べる
 */
const StationLabel = ({
    station,
    zoom,
    onSelect,
}: {
    station: MapStation;
    zoom: number;
    onSelect: (station: MapStation) => void;
}) => {
    // キーボードで押したときのクリックが地図まで伝わり、地図の click (当たり判定) が走らないようにする
    const stopPropagation = useCallback((element: HTMLButtonElement | null) => {
        if (element) {
            L.DomEvent.disableClickPropagation(element);
            L.DomEvent.disableScrollPropagation(element);
        }
    }, []);
    return (
        <PortalMarker position={station.point} zIndexOffset={500}>
            <StationMarker
                ref={stopPropagation}
                name={station.name}
                numberings={station.numberings}
                detail={stationDetailAt(zoom)}
                onSelect={() => onSelect(station)}
            />
        </PortalMarker>
    );
};

/** 鉄道: 路線 (タップで乗換案内) と駅 (タップで駅の案内) */
export const RailwayLayer = ({
    lines: polylines,
    circles,
    numberingColors,
    onSelect,
}: {
    lines: RailwayLine[];
    circles: RailwayCircle[];
    /** squaremap から推定した、ナンバリングの記号ごとの路線の色 */
    numberingColors: Record<string, string> | undefined;
    onSelect: SelectHandler;
}) => {
    const zoom = useZoom();
    // 駅の色やナンバリングは AdvanceRailway の API から取る。使えなければ squaremap の駅で描く
    const network = useRailwayNetwork(true);
    const stations = useMemo(
        () =>
            buildMapStations(
                circles,
                network.data?.stations ?? null,
                numberingColors,
            ),
        [circles, network.data, numberingColors],
    );
    // 駅を選んだら、駅の中心にポップアップを出す
    const selectStation = (station: MapStation) =>
        onSelect({
            kind: "station",
            position: station.point,
            station,
            fallbackLines: findLinesAtStation(station, stations, polylines),
        });
    // 駅のタップは地図の click で判定する。Leaflet はドラッグしたときは click を出さないので、
    // 駅の上から始めても地図を動かせる。路線・保護範囲の click の後に来るので、駅が選ばれたら上書きする
    useMapEvents({
        click: (event) => {
            const detail = stationDetailAt(zoom);
            const station = hitTestStation({
                // 丸めずに使う (拡大時は 1 ブロックが数 px になるため)
                tap: { x: event.latlng.lng, z: event.latlng.lat },
                pxPerBlock: 2 ** (zoom - NATIVE_MAX_ZOOM),
                stations,
                footprintOf: (target) =>
                    stationFootprint(target.numberings, detail),
                lines: polylines,
                line: {
                    halfWeight: RAILWAY_LINE_WEIGHT / 2,
                    tolerance: LINE_TAP_TOLERANCE,
                },
            });
            if (station) {
                selectStation(station);
            }
        },
    });
    return (
        <>
            {polylines.map((line) => {
                const { color } = line;
                return (
                    <Polyline
                        key={lineKey(line.points)}
                        positions={line.points.map(tupleToLatLng)}
                        pathOptions={{
                            color,
                            weight: RAILWAY_LINE_WEIGHT,
                            opacity: 0.9,
                        }}
                        eventHandlers={{
                            click: (event) =>
                                onSelect({
                                    kind: "railway",
                                    position: fromLatLng(
                                        event.latlng.lat,
                                        event.latlng.lng,
                                    ),
                                    route: line.route,
                                    color,
                                }),
                        }}
                    />
                );
            })}
            {stations.map((station) => (
                <StationLabel
                    key={station.id ?? `${station.point.x},${station.point.z}`}
                    station={station}
                    zoom={zoom}
                    onSelect={selectStation}
                />
            ))}
        </>
    );
};

/**
 * エリア保護: 1 万件を超えるため React の要素にはせず、
 * Leaflet の図形を canvas にまとめて描き、タップされた保護だけをポップアップに出す
 */
export const ClaimLayer = ({
    data,
    onSelect,
}: {
    data: CompactClaims;
    onSelect: SelectHandler;
}) => {
    const map = useMap();
    // 一般の保護はブランド色、運営の保護は別の色で見分ける
    const ownerColor = useResolvedColor(token.var("colors.mori.9"));
    const adminColor = useResolvedColor(token.var("colors.umi.9"));

    useEffect(() => {
        const group = L.layerGroup();
        for (const claim of data.claims) {
            const [x1, z1, x2, z2, , isAdmin] = claim;
            const color = isAdmin === 1 ? adminColor : ownerColor;
            L.rectangle(
                [
                    [z1, x1],
                    [z2, x2],
                ],
                {
                    color,
                    weight: 1,
                    fillColor: color,
                    fillOpacity: 0.15,
                },
            )
                .on("click", (event: L.LeafletMouseEvent) =>
                    onSelect({
                        kind: "claim",
                        position: fromLatLng(
                            event.latlng.lat,
                            event.latlng.lng,
                        ),
                        // 名前は辞書の番号で届くので、タップされた保護だけ名前に戻す
                        claim: toClaimInfo(data.names, claim),
                    }),
                )
                .addTo(group);
        }
        group.addTo(map);
        return () => {
            group.remove();
        };
    }, [map, data, ownerColor, adminColor, onSelect]);

    return null;
};

/** ワールドボーダー: 赤い枠線 (タップには反応しない) */
export const WorldBorderLayer = ({ lines }: { lines: BorderLine[] }) => (
    <>
        {lines.map((line) => (
            <Polyline
                key={lineKey(line.points)}
                positions={line.points.map(tupleToLatLng)}
                pathOptions={{
                    color: line.color,
                    weight: 2,
                    dashArray: "8 6",
                }}
                interactive={false}
            />
        ))}
    </>
);

/** バナー (町の名前) とスポーン地点のピン */
export const PinLayer = ({
    pins,
    variant,
}: {
    pins: MapPinData[];
    variant: "banner" | "spawn";
}) => (
    <>
        {pins.map((pin) => (
            <PortalMarker
                key={`${pin.point.x},${pin.point.z}`}
                position={pin.point}
            >
                <MapPin
                    label={pin.label}
                    icon={variant === "spawn" ? Flag : undefined}
                />
            </PortalMarker>
        ))}
    </>
);

/** オンラインのプレイヤー。同じワールドにいる人だけを出す */
// 名前チップ (高さ 52px・幅は名前しだい) どうしが重なるとみなす中心の距離 (px)
const PLAYER_CLUSTER_THRESHOLD = { dx: 112, dy: 52 };

export const PlayersLayer = ({
    players,
    self,
}: {
    players: MapPlayer[];
    self: SelfPlayer | null;
}) => {
    const map = useMap();
    // ズームが変わると画面上の距離が変わるため、まとめ直す
    const zoom = useZoom();
    // UUID の表記ゆれ (ハイフンの有無) をそろえて自分を探す
    const selfUuid = self?.id ? normalizeUuid(self.id) : null;
    const selfName = self?.name.toLowerCase();
    const isSelf = useCallback(
        (player: MapPlayer) =>
            normalizeUuid(player.uuid) === selfUuid ||
            player.name.toLowerCase() === selfName,
        [selfUuid, selfName],
    );
    const clusters = useMemo(() => {
        // 自分を先頭にして、自分と重なる人は自分を基準にまとめる
        const ordered = [
            ...players.filter(isSelf),
            ...players.filter((player) => !isSelf(player)),
        ];
        return clusterMapPlayers(
            ordered.map((player) => {
                // ズームごとの絶対的なピクセル座標。地図を動かしても変わらない
                const point = map.project(
                    toLatLng({ x: player.x, z: player.z }),
                    zoom,
                );
                return { player, px: point.x, py: point.y };
            }),
            PLAYER_CLUSTER_THRESHOLD,
        );
    }, [map, zoom, players, isSelf]);

    return (
        <>
            {clusters.map((cluster) => {
                const includesSelf = cluster.players.some(isSelf);
                const [first] = cluster.players;
                return (
                    <PortalMarker
                        key={cluster.key}
                        position={{ x: cluster.x, z: cluster.z }}
                        // プレイヤーは駅名やピンより上、自分 (を含むまとまり) はさらにその上に出す
                        zIndexOffset={includesSelf ? 2000 : 1000}
                    >
                        {cluster.players.length === 1 && first ? (
                            <PlayerMarker
                                playerId={first.uuid}
                                playerName={first.name}
                                isSelf={includesSelf}
                            />
                        ) : (
                            // 重なる人たちは 1 つのチップにまとめ、押すと全員の名前を出す
                            <PlayerClusterMarker
                                players={cluster.players.map((player) => ({
                                    id: player.uuid,
                                    name: player.name,
                                }))}
                            />
                        )}
                    </PortalMarker>
                );
            })}
        </>
    );
};
