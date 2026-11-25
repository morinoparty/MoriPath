import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "../../../../lib/auth-middleware";
import { getDiaryApiConfig } from "../../../../lib/diary-api";
import { fetchDiaryDocument } from "../../-functions/fetch-diary-document";
import { toDiaryEntries } from "../../-functions/to-diary-entries";
import {
    diaryByDateInputSchema,
    type DiaryDayResult,
} from "../-types/diary-day";

/**
 * 指定した日 (タームの開始日) のダイアリーを取る。
 * 日記が無い日は empty、取れなかったときは unavailable にして画面の移動は止めない
 */
export const getDiaryByDate = createServerFn()
    // ページの読み込みとは別に RPC として直接呼べるため、ここでもサインインを確かめる
    .middleware([authMiddleware])
    .validator(diaryByDateInputSchema)
    .handler(async ({ data }): Promise<DiaryDayResult> => {
        const config = getDiaryApiConfig();
        if (!config) {
            return { kind: "unavailable" };
        }

        try {
            const document = await fetchDiaryDocument(config, data.date);
            if (!document) {
                return { kind: "empty" };
            }
            return {
                kind: "found",
                day: {
                    date: document.date,
                    // 空のまとめは無いものとして扱う
                    summary: document.summary?.trim() || null,
                    entries: toDiaryEntries(document),
                },
            };
        } catch (error) {
            console.warn(`${data.date} のダイアリーを取得できません:`, error);
            return { kind: "unavailable" };
        }
    });
