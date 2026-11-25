import { waitUntil } from "cloudflare:workers";

// isolate をまたいで使い回す値を置く Cache API のキャッシュ (同じデータセンター内でだけ共有される)
const CACHE_NAME = "moripath-shared";
// キャッシュのキーは URL である必要があるため、外に出ない名前で組み立てる
const CACHE_KEY_ORIGIN = "https://moripath.internal/shared-cache/";

/** 共有キャッシュの 1 件。鮮度は保存した時刻から呼び出し側が判断する */
export interface SharedCacheEntry<T> {
    value: T;
    /** 保存した時刻 (ms) */
    savedAt: number;
}

const toKey = (name: string) =>
    `${CACHE_KEY_ORIGIN}${encodeURIComponent(name)}`;

/** 共有キャッシュから読む。無い・読めない (Cache API が使えない環境を含む) ときは undefined */
export async function readSharedCache<T>(
    name: string,
): Promise<SharedCacheEntry<T> | undefined> {
    try {
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match(toKey(name));
        if (!response) {
            return undefined;
        }
        return (await response.json()) as SharedCacheEntry<T>;
    } catch (error) {
        console.warn(`共有キャッシュ ${name} を読めません:`, error);
        return undefined;
    }
}

/**
 * 共有キャッシュに書く。maxAgeSeconds は Cache API に残しておく長さで、
 * 鮮度 (使い回すか取り直すか) は savedAt を見て読む側が決める
 */
export async function writeSharedCache<T>(
    name: string,
    entry: SharedCacheEntry<T>,
    maxAgeSeconds: number,
): Promise<void> {
    try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(
            toKey(name),
            new Response(JSON.stringify(entry), {
                headers: {
                    "content-type": "application/json",
                    "cache-control": `max-age=${maxAgeSeconds}`,
                },
            }),
        );
    } catch (error) {
        console.warn(`共有キャッシュ ${name} に書けません:`, error);
    }
}

/** 応答を返したあとも処理を続けさせる。失敗はログに残すだけにする */
export function runInBackground(task: Promise<unknown>): void {
    const guarded = task.catch((error: unknown) => {
        console.warn("裏で続けた処理が失敗しました:", error);
    });
    try {
        waitUntil(guarded);
    } catch {
        // リクエストの外 (テストなど) では待たせる先が無いので、そのまま走らせる
    }
}
