import type { MapMarker, Vec2 } from "../-types/world-map";

const pointKey = ({ x, z }: Vec2) => `${x},${z}`;

/**
 * マーカーの React の key。squaremap のマーカーには ID が無いため、種類と座標から作る。
 * 同じ区間の上り・下りは始点と終点が逆になるので区別できる
 */
export const markerKey = (marker: MapMarker): string => {
    switch (marker.type) {
        case "circle":
            return `circle:${pointKey(marker.center)}`;
        case "icon":
            return `icon:${pointKey(marker.point)}`;
        case "rectangle":
            return `rect:${pointKey(marker.points[0])}:${pointKey(marker.points[1])}`;
        case "polyline": {
            const first = marker.points[0];
            const last = marker.points[marker.points.length - 1];
            return `line:${first ? pointKey(first) : ""}:${last ? pointKey(last) : ""}:${marker.points.length}`;
        }
    }
};
