import type { TransitNetwork, TransitNetworkIndex } from "../-types/transit";

/** 駅と路線を ID・slug で引けるようにする (画面側で useMemo して使う) */
export const indexTransitNetwork = (
    network: TransitNetwork,
): TransitNetworkIndex => ({
    network,
    stationById: new Map(
        network.stations.map((station) => [station.id, station]),
    ),
    stationBySlug: new Map(
        network.stations.map((station) => [station.slug, station]),
    ),
    lineById: new Map(network.lines.map((line) => [line.id, line])),
    lineBySlug: new Map(network.lines.map((line) => [line.slug, line])),
});
