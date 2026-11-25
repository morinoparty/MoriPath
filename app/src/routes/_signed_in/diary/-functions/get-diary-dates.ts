import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDiaryApiConfig } from "../../../../lib/diary-api";
import { diaryDatesInputSchema } from "../-types/diary-day";

// 日付の帯は補助の表示なので、本文より短く待って諦める
const FETCH_TIMEOUT_MS = 2000;
// ダイアリー API の Cache-Control (private, max-age=60) に合わせる
const CACHE_TTL_MS = 60 * 1000;
const MAX_CACHE_ENTRIES = 16;

/** GET /v1/diaries の応答 (moritopa の diary-api と同じ形) */
const diaryDatesResponseSchema = z.object({
    dates: z.array(z.iso.date()),
});

// Workers ではリクエストをまたいで Promise を共有できないため、取得し終えた値だけを持つ
const cache = new Map<string, { value: string[]; expiresAt: number }>();

/**
 * before より前 (その日を含まない) で日記のある日付を、新しい順に最大 limit 件取る。
 * 一覧の API が無い・失敗したときは null を返し、帯は日記の有無を出さずに表示する
 */
export const getDiaryDates = createServerFn()
    .validator(diaryDatesInputSchema)
    .handler(async ({ data }): Promise<string[] | null> => {
        const config = getDiaryApiConfig();
        if (!config) {
            return null;
        }

        const key = `${data.before}:${data.limit}`;
        const now = Date.now();
        const cached = cache.get(key);
        if (cached && cached.expiresAt > now) {
            return cached.value;
        }

        try {
            const params = new URLSearchParams({
                before: data.before,
                limit: String(data.limit),
            });
            const response = await fetch(`${config.url}/v1/diaries?${params}`, {
                headers: { Authorization: `Bearer ${config.sharedKey}` },
                signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
            });
            // 一覧の API がまだ無い (404) 場合も含め、空の一覧とはみなさない (全部の日が押せなくなるため)
            if (!response.ok) {
                return null;
            }
            const { dates } = diaryDatesResponseSchema.parse(
                await response.json(),
            );

            cache.delete(key);
            cache.set(key, { value: dates, expiresAt: now + CACHE_TTL_MS });
            // 上限を超えたら古いものから捨てる (Map は追加順に並ぶ)
            for (const oldest of cache.keys()) {
                if (cache.size <= MAX_CACHE_ENTRIES) {
                    break;
                }
                cache.delete(oldest);
            }
            return dates;
        } catch (error) {
            console.warn("ダイアリーの日付一覧を取得できません:", error);
            return null;
        }
    });
