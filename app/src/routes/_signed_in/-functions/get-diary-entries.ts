import { createServerFn } from "@tanstack/react-start";
import { type DiaryApiConfig, getDiaryApiConfig } from "../../../lib/diary-api";
import { diaryDocumentSchema, type DiaryEntry } from "../-types/diary";
import { toDiaryEntries } from "./to-diary-entries";

// ホームの表示を待たせないよう、ダイアリー API が遅いときは早めに諦める
const FETCH_TIMEOUT_MS = 3000;
// API の Cache-Control (private, max-age=60) に合わせて isolate 内で使い回す
const CACHE_TTL_MS = 60 * 1000;

// Workers ではリクエストをまたいで Promise を共有できないため、取得し終えた値だけを持つ
let cache: { value: DiaryEntry[] | null; expiresAt: number } | undefined;

/** 最新のダイアリーを取得する。まだ無ければ null */
async function fetchLatestDiary(
    config: DiaryApiConfig,
): Promise<DiaryEntry[] | null> {
    const response = await fetch(`${config.url}/v1/diaries/latest`, {
        headers: { Authorization: `Bearer ${config.sharedKey}` },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    // 最初の日記が届く前は 404 になる
    if (response.status === 404) {
        return null;
    }
    if (!response.ok) {
        throw new Error(`ダイアリーの取得に失敗しました: ${response.status}`);
    }
    return toDiaryEntries(diaryDocumentSchema.parse(await response.json()));
}

/**
 * 「きょうのもりぱダイアリー」を取得する (タームの順)。
 * 取得できないときは null を返し、ホームの他の表示を巻き込まない
 */
export const getDiaryEntries = createServerFn().handler(
    async (): Promise<DiaryEntry[] | null> => {
        const config = getDiaryApiConfig();
        if (!config) {
            return null;
        }

        const now = Date.now();
        if (cache && cache.expiresAt > now) {
            return cache.value;
        }

        try {
            const value = await fetchLatestDiary(config);
            // 失敗はキャッシュせず、次のリクエストで取り直す
            cache = { value, expiresAt: now + CACHE_TTL_MS };
            return value;
        } catch (error) {
            console.warn("ダイアリーを取得できません:", error);
            return null;
        }
    },
);

export type DiaryEntriesData = Awaited<ReturnType<typeof getDiaryEntries>>;
