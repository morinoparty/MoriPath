import type { TransitStation } from "../-types/transit";
import type { TransitHero } from "../-types/transit-hero";
import { towns } from "./town-stations";

/**
 * 見出しの背景を決める。写真はその駅自身が街の駅のときだけ出し、近くの街の写真では代用しない。
 * 街の駅でなければ駅の場所の地図、地図の取得元やワールドが分からなければブロックの風景の絵にする
 */
export const resolveTransitHero = (
    station: TransitStation | null,
    worldMapUrl: string | null,
): TransitHero => {
    if (station?.town) {
        return { kind: "town", town: towns[station.town], station };
    }
    if (station?.worldId && worldMapUrl) {
        return {
            kind: "map",
            station,
            worldId: station.worldId,
            baseUrl: worldMapUrl,
        };
    }
    return { kind: "landscape", station };
};
