import L from "leaflet";
import { Flag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Polyline, useMap, useMapEvents } from "react-leaflet";
import { token } from "../../../../../../styled-system/tokens";
import { markerKey } from "../../-functions/marker-key";
import { parseClaimPopup } from "../../-functions/parse-claim-popup";
import {
    parseRailwayPopup,
    parseStationName,
} from "../../-functions/parse-railway-popup";
import { stripMarkerHtml } from "../../-functions/strip-marker-html";
import {
    fromLatLng,
    normalizeUuid,
    toLatLng,
} from "../../-functions/world-map-coords";
import type {
    ClaimInfo,
    MapPlayer,
    MarkerLayer,
    RailwayRoute,
    SelfPlayer,
    Vec2,
} from "../../-types/world-map";
import { MapPin } from "../map-pin";
import { PlayerMarker } from "../player-marker";
import { StationLabel } from "../station-label";
import { PortalMarker } from "./portal-marker";

/** タップされた図形と、ポップアップを出す位置 */
export type SelectedFeature =
    | { kind: "railway"; position: Vec2; route: RailwayRoute; color: string }
    | { kind: "claim"; position: Vec2; claim: ClaimInfo };

type SelectHandler = (feature: SelectedFeature) => void;

// 駅名は縮小すると重なって読めないため、このズーム以上でだけ出す
const STATION_LABEL_MIN_ZOOM = 2;

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

/** 鉄道: 路線 (タップで乗換案内) と駅名 */
export const RailwayLayer = ({
    layer,
    onSelect,
}: {
    layer: MarkerLayer;
    onSelect: SelectHandler;
}) => {
    const zoom = useZoom();
    return (
        <>
            {layer.markers.map((marker) => {
                if (marker.type === "polyline") {
                    const color = marker.color ?? marker.fillColor ?? "";
                    return (
                        <Polyline
                            key={markerKey(marker)}
                            positions={marker.points.map(toLatLng)}
                            pathOptions={{ color, weight: 5, opacity: 0.9 }}
                            eventHandlers={{
                                click: (event) =>
                                    onSelect({
                                        kind: "railway",
                                        position: fromLatLng(
                                            event.latlng.lat,
                                            event.latlng.lng,
                                        ),
                                        route: parseRailwayPopup(
                                            marker.popup ?? "",
                                        ),
                                        color,
                                    }),
                            }}
                        />
                    );
                }
                if (
                    marker.type === "circle" &&
                    zoom >= STATION_LABEL_MIN_ZOOM
                ) {
                    const name = parseStationName(marker.popup ?? "");
                    return name ? (
                        <PortalMarker
                            key={markerKey(marker)}
                            position={marker.center}
                        >
                            <StationLabel name={name} />
                        </PortalMarker>
                    ) : null;
                }
                return null;
            })}
        </>
    );
};

/**
 * エリア保護: 1 万件を超えるため React の要素にはせず、
 * Leaflet の図形を canvas にまとめて描き、タップされた保護だけをポップアップに出す
 */
export const ClaimLayer = ({
    layer,
    onSelect,
}: {
    layer: MarkerLayer;
    onSelect: SelectHandler;
}) => {
    const map = useMap();
    // 一般の保護はブランド色、運営の保護は別の色で見分ける
    const ownerColor = useResolvedColor(token.var("colors.mori.9"));
    const adminColor = useResolvedColor(token.var("colors.umi.9"));

    useEffect(() => {
        const group = L.layerGroup();
        for (const marker of layer.markers) {
            if (marker.type !== "rectangle") {
                continue;
            }
            const claim = parseClaimPopup(marker.popup ?? "");
            const color = claim.isAdmin ? adminColor : ownerColor;
            L.rectangle(
                [toLatLng(marker.points[0]), toLatLng(marker.points[1])],
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
                        claim,
                    }),
                )
                .addTo(group);
        }
        group.addTo(map);
        return () => {
            group.remove();
        };
    }, [map, layer, ownerColor, adminColor, onSelect]);

    return null;
};

/** ワールドボーダー: 赤い枠線 (タップには反応しない) */
export const WorldBorderLayer = ({ layer }: { layer: MarkerLayer }) => (
    <>
        {layer.markers.map((marker) =>
            marker.type === "polyline" ? (
                <Polyline
                    key={markerKey(marker)}
                    positions={marker.points.map(toLatLng)}
                    pathOptions={{
                        color: marker.color ?? "",
                        weight: 2,
                        dashArray: "8 6",
                    }}
                    interactive={false}
                />
            ) : null,
        )}
    </>
);

/** バナー (町の名前) とスポーン地点のピン */
export const PinLayer = ({
    layer,
    variant,
}: {
    layer: MarkerLayer;
    variant: "banner" | "spawn";
}) => (
    <>
        {layer.markers.map((marker) =>
            marker.type === "icon" ? (
                <PortalMarker key={markerKey(marker)} position={marker.point}>
                    <MapPin
                        label={stripMarkerHtml(marker.tooltip ?? "")}
                        icon={variant === "spawn" ? Flag : undefined}
                    />
                </PortalMarker>
            ) : null,
        )}
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
    const selfUuid = self ? normalizeUuid(self.id) : null;
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
