import { runInBackground } from "./run-in-background";

/**
 * 1 回の読み込みで並べて取る値の所要時間を測り、そろったところで 1 行だけログに出す。
 * 時間は読み込みの開始から数える (トークンの取得を待った分も含まれる)。
 * プレビューの Workers Logs で、どの取得が遅いかを見分けるために使う
 */
export function createLoadTimer(label: string) {
    const startedAt = Date.now();
    const parts: string[] = [];
    const pending: Promise<unknown>[] = [];

    return {
        /** task の終わった時刻を記録する。値が null (取得できなかった) なら印を付ける */
        track<T>(name: string, task: Promise<T>): Promise<T> {
            const tracked = task.then((value) => {
                const elapsed = Date.now() - startedAt;
                parts.push(
                    `${name}=${elapsed}ms${value === null ? "(null)" : ""}`,
                );
                return value;
            });
            pending.push(tracked);
            return tracked;
        },
        /** 記録したものがすべて終わったら 1 行出す。応答を返したあとも待たせる */
        finish(): void {
            runInBackground(
                Promise.allSettled(pending).then(() => {
                    const total = Date.now() - startedAt;
                    console.info(
                        `[${label}] ${parts.join(" ")} total=${total}ms`,
                    );
                }),
            );
        },
    };
}
