import type {
    GroupDto,
    StationDto,
} from "../../-functions/advance-railway-api";
import { toWorldId } from "../../-functions/world-id";
import type { TownSlug } from "../-types/town";
import type {
    TransitLine,
    TransitNetwork,
    TransitStation,
} from "../-types/transit";
import { splitLineName, splitStationName } from "./split-names";
import { townSlugByStationSlug } from "./town-stations";

/** 駅 ID の並びから、街の駅の街を順に重複なしで取り出す */
export const townsAlong = (
    stationIds: readonly string[],
    stationById: ReadonlyMap<string, TransitStation>,
): TownSlug[] => {
    const result: TownSlug[] = [];
    for (const id of stationIds) {
        const town = stationById.get(id)?.town;
        if (town && !result.includes(town)) {
            result.push(town);
        }
    }
    return result;
};

/**
 * AdvanceRailway の駅とグループを、乗換案内で使う形にする。
 * 路線の駅の並びは駅のナンバリングの position から決まるので、/railways は使わない
 */
export const buildTransitNetwork = (
    stationDtos: StationDto[],
    groupDtos: GroupDto[],
): TransitNetwork => {
    const groupById = new Map(groupDtos.map((group) => [group.id, group]));

    const stations: TransitStation[] = stationDtos.map((dto) => {
        const { name, reading } = splitStationName(dto.name);
        return {
            id: dto.id,
            slug: dto.slug,
            fullName: dto.name,
            name,
            reading,
            world: dto.world,
            worldId: toWorldId(dto.world),
            point: { x: dto.point.x, z: dto.point.z },
            numberings: dto.numberings.map((numbering) => ({
                lineId: numbering.group,
                code: numbering.numbering ?? null,
                position: numbering.position,
                color: groupById.get(numbering.group)?.color ?? null,
            })),
            // hasOwn で見て、"constructor" などの slug がプロトタイプに当たらないようにする
            town: Object.hasOwn(townSlugByStationSlug, dto.slug)
                ? townSlugByStationSlug[dto.slug]
                : null,
        };
    });
    stations.sort((a, b) => a.fullName.localeCompare(b.fullName, "ja"));
    const stationById = new Map(
        stations.map((station) => [station.id, station]),
    );

    // グループ → (position, 駅 ID) の一覧
    const membersByGroup = new Map<
        string,
        { position: number; stationId: string }[]
    >();
    for (const station of stations) {
        for (const numbering of station.numberings) {
            const members = membersByGroup.get(numbering.lineId) ?? [];
            members.push({
                position: numbering.position,
                stationId: station.id,
            });
            membersByGroup.set(numbering.lineId, members);
        }
    }

    const lines: TransitLine[] = groupDtos.map((group) => {
        const { name, subName } = splitLineName(group.name);
        // position 順。同じ position は駅名順 (stations の並び) のまま
        const stationIds = [...(membersByGroup.get(group.id) ?? [])]
            .sort((a, b) => a.position - b.position)
            .map((member) => member.stationId);
        return {
            id: group.id,
            slug: group.slug,
            name,
            subName,
            color: group.color,
            prefix: group.numberingPrefix ?? null,
            stationIds,
            towns: townsAlong(stationIds, stationById),
        };
    });
    lines.sort((a, b) => a.name.localeCompare(b.name, "ja"));

    return { stations, lines };
};
