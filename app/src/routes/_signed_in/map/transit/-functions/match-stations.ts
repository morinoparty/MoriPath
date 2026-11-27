import type { StationMatch, TransitStation } from "../-types/transit";

// 検索結果の既定の最大件数
const DEFAULT_LIMIT = 30;

// 全角の英数字・記号 (！〜～) と半角の差
const FULL_WIDTH_OFFSET = 0xfee0;
// カタカナとひらがなの差
const KATAKANA_OFFSET = 0x60;

// 1 文字 (UTF-16 の 1 単位) を正規化する。長さを変えないよう、1 単位を 1 単位にだけ置き換える
const normalizeChar = (char: string): string => {
    const code = char.charCodeAt(0);
    // 全角空白 → 半角空白
    if (code === 0x3000) return " ";
    // 全角の英数字・記号 (！〜～) → 半角
    if (code >= 0xff01 && code <= 0xff5e) {
        return String.fromCharCode(code - FULL_WIDTH_OFFSET).toLowerCase();
    }
    // カタカナ (ァ〜ヶ) → ひらがな
    if (code >= 0x30a1 && code <= 0x30f6) {
        return String.fromCharCode(code - KATAKANA_OFFSET);
    }
    // 英字の大文字 → 小文字 (ASCII だけ。ほかの文字は長さが変わりうるので触らない)
    if (code >= 0x41 && code <= 0x5a) {
        return String.fromCharCode(code + 0x20);
    }
    return char;
};

/** 1 文字ずつ置き換える正規化 (長さを変えない): 全角英数→半角、カタカナ→ひらがな、英字→小文字、全角空白→空白 */
export const normalizeForSearch = (value: string): string => {
    let result = "";
    for (let i = 0; i < value.length; i++) {
        result += normalizeChar(value[i]);
    }
    return result;
};

// 番号や slug は空白をはさんで打たれることがあるので、空白を除いて比べる
const removeSpaces = (value: string) => value.replace(/\s+/g, "");

/** 1 駅を検索語と比べる。当たらなければ null */
const matchStation = (
    station: TransitStation,
    query: string,
    compactQuery: string,
): StationMatch | null => {
    let score = Number.POSITIVE_INFINITY;

    // 番号 (PAK03) の完全一致と前方一致
    for (const numbering of station.numberings) {
        if (numbering.code === null) continue;
        const code = normalizeForSearch(numbering.code);
        if (code === compactQuery) {
            score = Math.min(score, 0);
        } else if (code.startsWith(compactQuery)) {
            score = Math.min(score, 2);
        }
    }

    // 名前 (読みがなを含む API の名前のまま) で当たった位置。長さを変えない正規化なので index がそのまま使える
    const fullName = normalizeForSearch(station.fullName);
    const position = fullName.indexOf(query);
    let nameRange: [number, number] | null =
        position === -1 ? null : [position, position + query.length];

    // 読みがなは fullName の末尾の全角かっこの中にある。
    // 正規化で全角かっこは半角になるので、元の名前で位置を探す (長さは変わらないので index は同じ)
    const readingStart = station.fullName.lastIndexOf("（") + 1;
    if (position === 0) {
        score = Math.min(score, 1);
    } else if (
        station.reading !== null &&
        readingStart > 0 &&
        fullName.startsWith(query, readingStart)
    ) {
        // 読みがなの前方一致。ハイライトも読みがなの先頭にそろえる
        score = Math.min(score, 1);
        nameRange = [readingStart, readingStart + query.length];
    } else if (position > 0) {
        score = Math.min(score, 3);
    }

    // slug の前方一致
    if (normalizeForSearch(station.slug).startsWith(compactQuery)) {
        score = Math.min(score, 4);
    }

    if (score === Number.POSITIVE_INFINITY) return null;
    return { station, score, nameRange };
};

/** 駅を探す。空の検索語は []。score → fullName の ja 順。最大 limit 件 (既定 30) */
export const searchStations = (
    stations: readonly TransitStation[],
    query: string,
    limit: number = DEFAULT_LIMIT,
): StationMatch[] => {
    const normalized = normalizeForSearch(query).trim();
    if (normalized === "") return [];
    const compact = removeSpaces(normalized);

    const matches: StationMatch[] = [];
    for (const station of stations) {
        const match = matchStation(station, normalized, compact);
        if (match) matches.push(match);
    }
    matches.sort(
        (a, b) =>
            a.score - b.score ||
            a.station.fullName.localeCompare(b.station.fullName, "ja"),
    );
    return matches.slice(0, limit);
};
