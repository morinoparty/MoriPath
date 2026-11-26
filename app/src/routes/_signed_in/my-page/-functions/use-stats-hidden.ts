import { useCallback, useSyncExternalStore } from "react";
import { readStatsHidden, serializeStatsHidden } from "./stats-hidden-cookie";

// cookie には変更イベントが無いため、書き換えたときに自分で購読者へ知らせる
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

const getSnapshot = () => readStatsHidden(document.cookie);

/**
 * マイページの数値を隠すかどうかと、その切り替え関数を返す。
 * SSR と hydration では loader がサーバーで読んだ値を使い (最初の描画で数字が見えないようにする)、
 * それ以降は cookie を直接読む。loader のキャッシュが古くても、切り替えた結果が戻らない
 */
export const useStatsHidden = (
    serverHidden: boolean,
): [boolean, (hidden: boolean) => void] => {
    const hidden = useSyncExternalStore(
        subscribe,
        getSnapshot,
        () => serverHidden,
    );
    const setHidden = useCallback((next: boolean) => {
        // oxlint-disable-next-line unicorn/no-document-cookie -- Cookie Store API は古い Safari で使えず、書く値は 1 つだけなので直接書く
        document.cookie = serializeStatsHidden(next);
        for (const listener of listeners) {
            listener();
        }
    }, []);
    return [hidden, setHidden];
};
