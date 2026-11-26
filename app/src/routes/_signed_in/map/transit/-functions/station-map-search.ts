import { mapPinSearch } from "../../-functions/map-pin-param";
import type { TransitStation } from "../-types/transit";

/** /map の駅ピンへ飛ぶ Link の search。ワールドが分からなければ null (ボタンを出さない) */
export const stationMapSearch = (
    station: TransitStation,
): ReturnType<typeof mapPinSearch> | null =>
    station.worldId === null
        ? null
        : mapPinSearch({
              world: station.worldId,
              type: "station",
              x: station.point.x,
              z: station.point.z,
              label: station.name,
          });
