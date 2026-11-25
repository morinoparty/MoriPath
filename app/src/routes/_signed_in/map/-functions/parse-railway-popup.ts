import type { RailwayRoute } from "../-types/world-map";
import { stripMarkerHtml } from "./strip-marker-html";

// 「行き先 : A <-> B」の矢印の前後で駅名を分ける
const destinationPattern = /行き先\s*:\s*(.+?)\s*(<->|->)\s*(.+?)\s*$/;
const travelTimePattern = /所要時間\s*:\s*(.+?)\s*$/;

/**
 * 鉄道の路線 (折れ線) のポップアップを乗換案内に変換する。
 * 形式: 「行き先 : A <-> B </span><br/>\n所要時間 : 約 0.9 分 </span><br/>\n路線名」
 */
export const parseRailwayPopup = (html: string): RailwayRoute => {
    // 行ごとに分けてからタグを落とす (矢印の < > をタグと誤認しないよう、行の分割を先にする)
    const lines = html
        .split(/<br\s*\/?>/i)
        .map((line) => line.replace(/<\/?span[^>]*>/gi, "").trim())
        .filter(Boolean);

    let fromStation = "";
    let toStation = "";
    let direction: RailwayRoute["direction"] = null;
    let travelTime = "";
    let lineName = "";

    for (const line of lines) {
        const destination = line.match(destinationPattern);
        if (destination) {
            fromStation = stripMarkerHtml(destination[1]);
            toStation = stripMarkerHtml(destination[3]);
            direction = destination[2] === "<->" ? "both" : "oneWay";
            continue;
        }
        const time = line.match(travelTimePattern);
        if (time) {
            travelTime = stripMarkerHtml(time[1]);
            continue;
        }
        // 見出しの付いていない最後の行が路線名
        lineName = stripMarkerHtml(line);
    }

    return { lineName, fromStation, toStation, travelTime, direction };
};

/**
 * 駅 (円) のポップアップから駅名を取り出す。
 * 形式: 「FM06 </span><br/>\n名前 : 空島 </span><br/>」。名前が無ければ null
 */
export const parseStationName = (html: string): string | null => {
    const match = stripMarkerHtml(html).match(/名前\s*:\s*(.+)$/);
    return match ? match[1].trim() : null;
};
