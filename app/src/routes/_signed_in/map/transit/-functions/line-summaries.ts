import type { TownSlug } from "../-types/town";
import type {
    LineStationRow,
    LineSummary,
    TransitLine,
    TransitNetworkIndex,
    TransitStation,
} from "../-types/transit";

// 一覧に出す路線の最小の駅数 (1 駅だけの路線は乗れないので出さない)
const MIN_LINE_STATIONS = 2;

// 路線の駅を position 順に引く。索引に無い ID は飛ばす
const stationsOf = (
    line: TransitLine,
    index: TransitNetworkIndex,
): TransitStation[] =>
    line.stationIds.flatMap((id) => {
        const station = index.stationById.get(id);
        return station ? [station] : [];
    });

/** 2 駅以上の路線を、出発駅を通る路線 → それ以外の順 (それぞれ name の ja 順) に並べる */
export const summarizeLines = (
    index: TransitNetworkIndex,
    fromStationId: string | null,
): LineSummary[] => {
    const summaries = index.network.lines
        .filter((line) => line.stationIds.length >= MIN_LINE_STATIONS)
        .map((line): LineSummary => {
            const first = index.stationById.get(line.stationIds[0]);
            const last = index.stationById.get(line.stationIds.at(-1) ?? "");
            return {
                line,
                passesFrom:
                    fromStationId !== null &&
                    line.stationIds.includes(fromStationId),
                firstName: first?.name ?? "",
                lastName: last?.name ?? "",
            };
        });
    // network.lines は name の ja 順なので、安定ソートで出発駅を通る路線だけを前に出す
    return summaries.sort(
        (a, b) => Number(b.passesFrom) - Number(a.passesFrom),
    );
};

/** 路線図の行 (position 順) */
export const lineStationRows = (
    line: TransitLine,
    index: TransitNetworkIndex,
): LineStationRow[] =>
    stationsOf(line, index).map((station) => ({
        station,
        code:
            station.numberings.find((numbering) => numbering.lineId === line.id)
                ?.code ?? null,
        // 乗換の路線は番号があるものだけ出す
        transfers: station.numberings.filter(
            (numbering) =>
                numbering.lineId !== line.id && numbering.code !== null,
        ),
    }));

/** 特集カードの両端の街。始点・終点がそれぞれ街の駅ならその街、そうでなければ null (近くの街では代えない) */
export const lineTerminalTowns = (
    line: TransitLine,
    index: TransitNetworkIndex,
): [TownSlug | null, TownSlug | null] => {
    const stations = stationsOf(line, index);
    return [stations[0]?.town ?? null, stations.at(-1)?.town ?? null];
};
