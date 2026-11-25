import type { Vec2 } from "./world-map";

/** /map の pin パラメータで指せる地点の種類 */
export const mapPinTypes = ["shop", "claim", "station", "point"] as const;

export type MapPinType = (typeof mapPinTypes)[number];

/** 他の画面から /map に渡す「この地点を見てほしい」という目印 */
export interface MapPinTarget extends Vec2 {
    type: MapPinType;
}
