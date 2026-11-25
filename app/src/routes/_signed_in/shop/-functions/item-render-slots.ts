// MinecraftItem のブロックは 1 つずつ WebGL の Canvas を作る。ブラウザが同時に持てる
// WebGL コンテキストは 16 前後で、超えると古いものから消えて空白になるため、
// 同時に描くアイテムの数をここで絞る (詳細シートの 1 つ分と余裕を残す)
export const MAX_RENDERED_ITEMS = 12;

type Listener = () => void;

/**
 * 「描いてよいアイテム」の枠を先着順に配る小さな store。
 * 画面に入ったアイコンが request し、出たら release する。枠が空くと待っているものに回る
 */
export const createItemRenderSlots = (capacity: number) => {
    // 枠を持っているもの
    const holders = new Set<symbol>();
    // 枠が空くのを待っているもの (先着順)
    const waiting: symbol[] = [];
    const listeners = new Set<Listener>();

    const notify = () => {
        for (const listener of listeners) {
            listener();
        }
    };

    // 空いた枠を、待っている順に回す
    const fill = () => {
        while (holders.size < capacity && waiting.length > 0) {
            const next = waiting.shift();
            if (next) {
                holders.add(next);
            }
        }
    };

    return {
        request(token: symbol) {
            if (holders.has(token) || waiting.includes(token)) {
                return;
            }
            waiting.push(token);
            fill();
            notify();
        },
        release(token: symbol) {
            holders.delete(token);
            const index = waiting.indexOf(token);
            if (index >= 0) {
                waiting.splice(index, 1);
            }
            fill();
            notify();
        },
        has: (token: symbol) => holders.has(token),
        subscribe(listener: Listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
};

/** アプリ全体で共有する枠 (一覧と詳細シートで同じ上限を使う) */
export const itemRenderSlots = createItemRenderSlots(MAX_RENDERED_ITEMS);
