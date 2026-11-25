import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "../../../../lib/auth-middleware";
import { getDiaryApiConfig } from "../../../../lib/diary-api";
import { fetchDiaryDocument } from "../../-functions/fetch-diary-document";
import { toDiaryEntries } from "../../-functions/to-diary-entries";
import type { DiaryDocument } from "../../-types/diary";
import {
    type DiaryDayResult,
    type DiaryPageData,
    diaryPageInputSchema,
} from "../-types/diary-day";
import {
    addDays,
    DIARY_STRIP_LENGTH,
    diaryStripEnd,
    toDiaryTermDate,
} from "./diary-date";
import { fetchDiaryDates } from "./fetch-diary-dates";

/** 取れたドキュメントを画面に出す形にする */
const toDayResult = (document: DiaryDocument | null): DiaryDayResult =>
    document
        ? {
              kind: "found",
              day: {
                  date: document.date,
                  // 空のまとめは無いものとして扱う
                  summary: document.summary?.trim() || null,
                  entries: toDiaryEntries(document),
              },
          }
        : { kind: "empty" };

/**
 * /diary/$date の 1 画面分 (その日・帯の日付一覧・最新の日) をまとめて取る。
 * サインインの確認を 1 回で済ませ、ダイアリー API へは並べて問い合わせる。
 * どれかが取れなくても画面は出し、日付の移動は使えるようにする
 */
export const getDiaryPage = createServerFn()
    // ページの読み込みとは別に RPC として直接呼べるため、ここでもサインインを確かめる
    .middleware([authMiddleware])
    .validator(diaryPageInputSchema)
    .handler(async ({ data: { date } }): Promise<DiaryPageData> => {
        const config = getDiaryApiConfig();
        if (!config) {
            return {
                result: { kind: "unavailable" },
                existingDates: null,
                latestDate: null,
            };
        }

        const startedAt = Date.now();
        const today = toDiaryTermDate(new Date());
        // 「次の日」の上限に使う。ホームと同じキャッシュに乗る
        const latest = fetchDiaryDocument(config, "latest").catch(
            (error: unknown) => {
                console.warn("最新のダイアリーを取得できません:", error);
                return null;
            },
        );
        // 今日を開いたときは最新がたいていその日なので、最新を待って同じ日なら使い回す (API を 1 回減らす)
        const document =
            date === today
                ? latest.then((value) =>
                      value?.date === date
                          ? value
                          : fetchDiaryDocument(config, date),
                  )
                : fetchDiaryDocument(config, date);
        // 帯に並べる範囲で日記のある日 (before は含まないので最後の日の翌日を渡す)
        const existingDates = fetchDiaryDates(config, {
            before: addDays(diaryStripEnd(date, today), 1),
            limit: DIARY_STRIP_LENGTH,
        });

        const [result, dates, latestDocument] = await Promise.all([
            document.then(toDayResult).catch((error: unknown) => {
                console.warn(`${date} のダイアリーを取得できません:`, error);
                return { kind: "unavailable" } satisfies DiaryDayResult;
            }),
            existingDates,
            latest,
        ]);
        // プレビューの Workers Logs で、ダイアリー API の待ち時間を見分けるために残す
        console.info(
            `[diary-page] date=${date} result=${result.kind} total=${Date.now() - startedAt}ms`,
        );
        return {
            result,
            existingDates: dates,
            latestDate: latestDocument?.date ?? null,
        };
    });
