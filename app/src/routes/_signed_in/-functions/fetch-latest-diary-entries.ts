import { getDiaryApiConfig } from "../../../lib/diary-api";
import type { DiaryEntry } from "../-types/diary";
import { fetchDiaryDocument } from "./fetch-diary-document";
import { toDiaryEntries } from "./to-diary-entries";

/**
 * 「きょうのもりぱダイアリー」を取得する (タームの順)。
 * 取得できないときは null を返し、ホームの他の表示を巻き込まない
 */
export async function fetchLatestDiaryEntries(): Promise<DiaryEntry[] | null> {
    const config = getDiaryApiConfig();
    if (!config) {
        return null;
    }

    try {
        const document = await fetchDiaryDocument(config, "latest");
        return document ? toDiaryEntries(document) : null;
    } catch (error) {
        console.warn("ダイアリーを取得できません:", error);
        return null;
    }
}
