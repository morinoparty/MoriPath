// 末尾の全角かっこ (読みがな)。「紅島（べにじま）」
const stationReadingPattern = /^(.*?)\s*（([^（）]*)）\s*$/u;
// 末尾の半角または全角かっこ (路線の別名)。「…ライン(緑草線)」
const lineSubNamePattern = /^(.*?)\s*(?:\(([^()]*)\)|（([^（）]*)）)\s*$/u;

/** 「紅島（べにじま）」→ { name: "紅島", reading: "べにじま" }。全角かっこが末尾に無ければ reading は null */
export const splitStationName = (
    fullName: string,
): { name: string; reading: string | null } => {
    const match = stationReadingPattern.exec(fullName);
    // かっこの前が空 (名前がかっこだけ) なら分けずにそのまま出す
    if (!match || match[1] === "" || match[2].trim() === "") {
        return { name: fullName, reading: null };
    }
    return { name: match[1], reading: match[2].trim() };
};

/** 「…ライン(緑草線)」→ { name: "…ライン", subName: "緑草線" }。末尾の ( ) または （ ） */
export const splitLineName = (
    fullName: string,
): { name: string; subName: string | null } => {
    const match = lineSubNamePattern.exec(fullName);
    const subName = (match?.[2] ?? match?.[3] ?? "").trim();
    // かっこの前が空、またはかっこの中が空なら分けない
    if (!match || match[1] === "" || subName === "") {
        return { name: fullName, subName: null };
    }
    return { name: match[1], subName };
};
