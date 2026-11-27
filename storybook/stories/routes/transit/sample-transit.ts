import type {
    GroupDto,
    RouteResponseDto,
    StationDto,
} from "@/routes/_signed_in/map/-functions/advance-railway-api";
import { buildTransitNetwork } from "@/routes/_signed_in/map/transit/-functions/build-transit-network";
import { buildTransitRoute } from "@/routes/_signed_in/map/transit/-functions/build-transit-route";
import { indexTransitNetwork } from "@/routes/_signed_in/map/transit/-functions/index-transit-network";
import type {
    SelfPosition,
    TransitNetwork,
    TransitNetworkIndex,
    TransitRoute,
    TransitStation,
} from "@/routes/_signed_in/map/transit/-types/transit";
import groupsJson from "./fixtures/groups.json";
import routeJson from "./fixtures/route-mrmt-sekk.json";
import stationsJson from "./fixtures/stations.json";

// AdvanceRailway の /stations と /groups の実際の応答 (175 駅・34 路線) から作った見本の鉄道網
export const sampleNetwork: TransitNetwork = buildTransitNetwork(
    stationsJson.stations as StationDto[],
    groupsJson.groups as GroupDto[],
);

export const sampleIndex: TransitNetworkIndex =
    indexTransitNetwork(sampleNetwork);

const routeDto = routeJson as RouteResponseDto;

/** もりもと → 雪華郷 (うみもと線 → 森元森林鉄道 → 迷大鉄道、乗りかえ 2 回) */
export const sampleRoute: TransitRoute = buildTransitRoute(
    routeDto,
    sampleIndex,
);

/** うみもとうだい→築別 (森元森林鉄道) の区間を徒歩に置き換えた手作りの経路 (WALK の見た目確認用) */
export const sampleRouteWithWalk: TransitRoute = buildTransitRoute(
    {
        ...routeDto,
        legs: routeDto.legs.map((leg, i) =>
            i === 4
                ? {
                      ...leg,
                      mode: "WALK",
                      railway: null,
                      railwaySlug: null,
                      group: null,
                      line: null,
                  }
                : leg,
        ),
    },
    sampleIndex,
);

/** slug から見本の駅を引く。見本に無い slug はストーリーの書き間違いなので投げる */
export const sampleStation = (slug: string): TransitStation => {
    const station = sampleIndex.stationBySlug.get(slug);
    if (!station) throw new Error(`見本に駅 ${slug} がありません`);
    return station;
};

const morimoto = sampleStation("mrmt");

/** もりもと駅の少し北東に立っている自分 */
export const sampleSelfPosition: SelfPosition = {
    world: "minecraft_overworld",
    x: morimoto.point.x + 40,
    z: morimoto.point.z + 30,
};

/** さいきん選んだ駅 (新しい順) */
export const sampleRecentSlugs: string[] = ["ummt", "atmn", "kmmr", "bnii"];
