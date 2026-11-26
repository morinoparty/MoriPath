import { useCallback, useSyncExternalStore } from "react";
import { z } from "zod";

// localStorage のキー
const STORAGE_KEY = "moripath.transit.recent-stations";
// 覚えておく駅の数
const MAX_RECENT = 6;

const storedSchema = z.array(z.string());

// SSR と hydration で使う空の一覧 (毎回同じ参照を返す)
const EMPTY: readonly string[] = Object.freeze([]);

// localStorage の変更は同じタブには届かないので、書き換えたときに自分で購読者へ知らせる
const listeners = new Set<() => void>();

const notify = () => {
    for (const listener of listeners) {
        listener();
    }
};

// ほかのタブで書き換えられたときも追いかける
const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) notify();
};

const subscribe = (listener: () => void) => {
    if (listeners.size === 0) window.addEventListener("storage", handleStorage);
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
            window.removeEventListener("storage", handleStorage);
        }
    };
};

// プライベートウィンドウなどでは localStorage 自体が例外を投げるので包む
const readRaw = (): string | null => {
    try {
        return window.localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
};

const parseRaw = (raw: string | null): readonly string[] => {
    if (raw === null) return EMPTY;
    try {
        const parsed = storedSchema.safeParse(JSON.parse(raw));
        return parsed.success ? parsed.data.slice(0, MAX_RECENT) : EMPTY;
    } catch {
        return EMPTY;
    }
};

// useSyncExternalStore は参照が変わると描画し直すので、元の文字列が同じあいだは同じ配列を返す
let cachedRaw: string | null = null;
let cachedSlugs: readonly string[] = EMPTY;

const getSnapshot = (): readonly string[] => {
    const raw = readRaw();
    if (raw !== cachedRaw) {
        cachedRaw = raw;
        cachedSlugs = parseRaw(raw);
    }
    return cachedSlugs;
};

const getServerSnapshot = () => EMPTY;

/** さいきん選んだ駅の slug (新しい順、最大 6)。SSR と hydration では []。localStorage は try/catch で包む */
export const useRecentStations = (): readonly [
    slugs: readonly string[],
    push: (slug: string) => void,
] => {
    const slugs = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
    );
    const push = useCallback((slug: string) => {
        // 同じ駅は先頭へ移し、古いものから消す
        const next = [
            slug,
            ...getSnapshot().filter((item) => item !== slug),
        ].slice(0, MAX_RECENT);
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
            // 保存できなくても画面の操作は続けられるので無視する
            return;
        }
        notify();
    }, []);
    return [slugs, push] as const;
};
