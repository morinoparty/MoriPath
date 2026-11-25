import { createServerFn } from "@tanstack/react-start";
import { getDiaryApiConfig } from "../../../../lib/diary-api";
import { fetchDiaryDocument } from "../../-functions/fetch-diary-document";

/** いちばん新しいダイアリーの日付。まだ無い・取れないときは null */
export const getLatestDiaryDate = createServerFn().handler(
    async (): Promise<string | null> => {
        const config = getDiaryApiConfig();
        if (!config) {
            return null;
        }

        try {
            // ホームの「きょうのもりぱダイアリー」と同じキャッシュを使う
            const document = await fetchDiaryDocument(config, "latest");
            return document?.date ?? null;
        } catch (error) {
            console.warn("最新のダイアリーを取得できません:", error);
            return null;
        }
    },
);
