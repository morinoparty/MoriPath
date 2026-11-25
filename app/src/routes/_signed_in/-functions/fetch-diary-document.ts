import type { DiaryApiConfig } from "../../../lib/diary-api";
import { type DiaryDocument, diaryDocumentSchema } from "../-types/diary";

// 画面の表示を待たせないよう、ダイアリー API が遅いときは早めに諦める
const FETCH_TIMEOUT_MS = 3000;
// API の Cache-Control (private, max-age=60) に合わせて isolate 内で使い回す
const CACHE_TTL_MS = 60 * 1000;
// まとめの付いた (締まった) 日はもう変わらないため、長く使い回す
const CLOSED_DAY_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
// 日付を遡るたびに増え続けないよう、覚えておく日数に上限を設ける
const MAX_CACHE_ENTRIES = 64;

// Workers ではリクエストをまたいで Promise を共有できないため、取得し終えた値だけを持つ
const cache = new Map<
    string,
    { value: DiaryDocument | null; expiresAt: number }
>();

/** 取得した値を覚える。上限を超えたら古いものから捨てる (Map は追加順に並ぶ) */
const remember = (key: string, value: DiaryDocument | null, now: number) => {
    // "latest" は翌日に別の日を指すので、締まっていても短くする
    const ttl =
        key !== "latest" && value?.summary?.trim()
            ? CLOSED_DAY_CACHE_TTL_MS
            : CACHE_TTL_MS;
    cache.delete(key);
    cache.set(key, { value, expiresAt: now + ttl });
    for (const oldest of cache.keys()) {
        if (cache.size <= MAX_CACHE_ENTRIES) {
            break;
        }
        cache.delete(oldest);
    }
};

/**
 * ダイアリー API から 1 日分のドキュメントを取る。
 * target は "latest" か YYYY-MM-DD。その日の日記が無ければ null、取得に失敗したら例外にする
 */
export async function fetchDiaryDocument(
    config: DiaryApiConfig,
    target: string,
): Promise<DiaryDocument | null> {
    const now = Date.now();
    const cached = cache.get(target);
    if (cached && cached.expiresAt > now) {
        return cached.value;
    }

    const response = await fetch(
        `${config.url}/v1/diaries/${encodeURIComponent(target)}`,
        {
            headers: { Authorization: `Bearer ${config.sharedKey}` },
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        },
    );
    // 最初の日記が届く前や、記録の無い日は 404 になる
    if (response.status === 404) {
        remember(target, null, now);
        return null;
    }
    // 失敗はキャッシュせず、次のリクエストで取り直す
    if (!response.ok) {
        throw new Error(`ダイアリーの取得に失敗しました: ${response.status}`);
    }
    const value = diaryDocumentSchema.parse(await response.json());
    remember(target, value, now);
    // 最新はその日付でも引かれる (/diary/今日) ので、日付のほうにも覚えておく
    if (target === "latest") {
        remember(value.date, value, now);
    }
    return value;
}
