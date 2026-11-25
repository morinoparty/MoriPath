import L from "leaflet";
import { NATIVE_MAX_ZOOM } from "../../-functions/world-map-coords";

/**
 * squaremap のタイルに合わせた CRS。
 * lat = z、lng = x のまま扱い、zoom 3 で 1 ブロック = 1 px になるよう 1/8 倍する。
 * Leaflet 既定の CRS.Simple は y を反転するが、Minecraft の z は南向きに増えるので反転しない
 */
export const createMinecraftCrs = (): L.CRS => {
    const scale = 1 / 2 ** NATIVE_MAX_ZOOM;
    return L.Util.extend({}, L.CRS.Simple, {
        transformation: new L.Transformation(scale, 0, scale, 0),
    });
};
