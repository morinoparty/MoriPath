import L from "leaflet";
import { Flag } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Polyline, useMap, useMapEvents } from "react-leaflet";
import { token } from "../../../../../../styled-system/tokens";
import {
    buildMapStations,
    findLinesAtStation,
} from "../../-functions/build-map-stations";
import { toClaimInfo } from "../../-functions/to-claim-info";
import { useRailwayNetwork } from "../../-functions/use-railway-network";
import {
    fromLatLng,
    NATIVE_MAX_ZOOM,
    normalizeUuid,
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
import { PlayerMarker } from "../player-marker";
import { StationMarker, type StationMarkerDetail } from "../station-marker";
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
 * 駅 1 つ分の当たり判定。駅のボタンを押したとき、地図 (と下の路線) にクリックを渡さない。
 * こうすると駅の周りでは路線の乗換案内ではなく駅が選ばれる
 */
const StationHitTarget = ({
    station,
    zoom,
    onSelect,
}: {
    station: MapStation;
    zoom: number;
    onSelect: (station: MapStation) => void;
}) => {
    // Leaflet は地図の要素でクリックやドラッグを拾うので、ボタンの外へ伝えない
    const stopPropagation = useCallback((element: HTMLButtonElement | null) => {
        if (element) {
            L.DomEvent.disableClickPropagation(element);
            L.DomEvent.disableScrollPropagation(element);
        }
    }, []);
    // 駅の円 (半径はブロック単位) を今の縮尺の px に直した大きさ
    const hitSize = station.radius * 2 * 2 ** (zoom - NATIVE_MAX_ZOOM);
    return (
        <PortalMarker position={station.point} zIndexOffset={500}>
            <StationMarker
                ref={stopPropagation}
                name={station.name}
                numberings={station.numberings}
                detail={stationDetailAt(zoom)}
                hitSize={hitSize}
                onSelect={() => onSelect(station)}
            />
        </PortalMarker>
    );
};

/** 鉄道: 路線 (タップで乗換案内) と駅 (タップで駅の案内) */
export const RailwayLayer = ({
    lines: polylines,
    circles,
    onSelect,
}: {
    lines: RailwayLine[];
    circles: RailwayCircle[];
    onSelect: SelectHandler;
}) => {
    const zoom = useZoom();
    // 駅の色やナンバリングは AdvanceRailway の API から取る。使えなければ squaremap の駅で描く
    const network = useRailwayNetwork(true);
    const stations = useMemo(
        () => buildMapStations(circles, network.data?.stations ?? null),
        [circles, network.data],
    );
    // 駅を選んだら、駅の中心にポップアップを出す
    const selectStation = (station: MapStation) =>
        onSelect({
            kind: "station",
            position: station.point,
            station,
            fallbackLines: findLinesAtStation(station, stations, polylines),
        });
    return (
        <>
            {polylines.map((line) => {
                const { color } = line;
                return (
                    <Polyline
                        key={lineKey(line.points)}
                        positions={line.points.map(tupleToLatLng)}
                        pathOptions={{ color, weight: 5, opacity: 0.9 }}
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
                <StationHitTarget
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
export const PlayersLayer = ({
    players,
    self,
}: {
    players: MapPlayer[];
    self: SelfPlayer | null;
}) => {
    // UUID の表記ゆれ (ハイフンの有無) をそろえて自分を探す
    const selfUuid = self?.id ? normalizeUuid(self.id) : null;
    const selfName = self?.name.toLowerCase();
    return (
        <>
            {players.map((player) => {
                const isSelf =
                    normalizeUuid(player.uuid) === selfUuid ||
                    player.name.toLowerCase() === selfName;
                return (
                    <PortalMarker
                        key={player.uuid}
                        position={{ x: player.x, z: player.z }}
                        // プレイヤーは駅名やピンより上、自分はさらにその上に出す
                        zIndexOffset={isSelf ? 2000 : 1000}
                    >
                        <PlayerMarker
                            playerId={player.uuid}
                            playerName={player.name}
                            isSelf={isSelf}
                        />
                    </PortalMarker>
                );
            })}
        </>
    );
};
