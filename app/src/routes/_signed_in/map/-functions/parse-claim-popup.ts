import type { ClaimInfo } from "../-types/world-map";
import { stripMarkerHtml } from "./strip-marker-html";

/** 「ラベル: <span>a, b</span>」の値をカンマで分けて取り出す */
const extractList = (html: string, label: string): string[] => {
    // 「Trust:」が「Permission Trust:」の一部に当たらないよう、行頭か <br/> の直後に限る
    const pattern = new RegExp(
        `(?:^|<br\\s*/?>)\\s*${label}:\\s*<span[^>]*>(.*?)</span>`,
        "i",
    );
    const match = html.match(pattern);
    if (!match) {
        return [];
    }
    return stripMarkerHtml(match[1])
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
};

/**
 * GriefPrevention の保護範囲のポップアップを読み取る。
 * 一般の保護は「Claim Owner: <span>名前</span>」、運営の保護は先頭が「Administrator Claim」
 */
export const parseClaimPopup = (html: string): ClaimInfo => {
    const owner = html.match(/Claim Owner:\s*<span[^>]*>(.*?)<\/span>/i);
    return {
        isAdmin: /Administrator Claim/i.test(html),
        owner: owner ? stripMarkerHtml(owner[1]) : "",
        permissionTrust: extractList(html, "Permission Trust"),
        trust: extractList(html, "Trust"),
        containerTrust: extractList(html, "Container Trust"),
        accessTrust: extractList(html, "Access Trust"),
    };
};
