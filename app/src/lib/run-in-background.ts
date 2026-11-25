import { waitUntil } from "cloudflare:workers";

/** 応答を返したあとも処理を続けさせる (Workers の waitUntil)。失敗はログに残すだけにする */
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
