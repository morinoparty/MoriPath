import type { QuickShop } from "../-types/shop";

/** お店の一覧 API の 1 ページ分 (カーソルは数値にそろえたもの) */
export interface ShopPageResult {
    shops: QuickShop[];
    /** 次のページのカーソル (最後に返したお店の ID)。終わりなら null */
    nextCursor: number | null;
    hasMore: boolean;
}

/** cursor より大きい ID のお店を 1 ページ分取る */
export type FetchShopPage = (cursor: number) => Promise<ShopPageResult>;

export interface ScanShopsOptions {
    /** 区間を同時に取る数。ゲームサーバーの負荷と Workers の同時接続数の上限に合わせる */
    concurrency: number;
    /** 1 回の走査で取るページ数の上限 (ページ送りが止まらなくなったときの安全弁) */
    maxPages: number;
}

export interface ScanShopsResult {
    /** ID の昇順に並んだ、重複のないお店 */
    shops: QuickShop[];
    /** 取得に失敗して欠けた区間があれば true */
    partial: boolean;
}

/** 応答のカーソル (文字列か数値) を数値にそろえる。読めなければ null */
export const toCursor = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) {
        return null;
    }
    const cursor = Number(value);
    return Number.isFinite(cursor) ? cursor : null;
};

/**
 * 次の走査で区間の始まりに使うカーソルを、いまの一覧から作る。
 * 区間ごとに 1 ページで収まるよう、ページの上限より少し少ない件数ごとに区切る
 */
export const toSegmentStarts = (
    shops: readonly QuickShop[],
    segmentSize: number,
): number[] => {
    const starts = [0];
    for (let index = segmentSize; index < shops.length; index += segmentSize) {
        // カーソルは「この ID より大きい」の意味なので、区間の直前のお店の ID を使う
        starts.push(shops[index - 1].shopId);
    }
    return starts;
};

/**
 * お店の一覧を ID の区間に分けて並行に取る。
 * カーソルは「この ID より大きいお店から」を表すので、区間 (starts[i], starts[i + 1]] を
 * 別々に取っても合わせれば全体になる。区間の始まりは前回の一覧から作った目安で、
 * 区間に 1 ページで収まらないお店があれば、その区間だけ続きのページを取る。
 * 最後の区間は hasMore が false になるまで取る (始まりが [0] だけなら従来どおりの順番取り)
 */
export async function scanShops(
    fetchPage: FetchShopPage,
    segmentStarts: readonly number[],
    options: ScanShopsOptions,
): Promise<ScanShopsResult> {
    // 先頭を必ず 0 (すべて) にし、重複を除いて昇順に並べる
    const starts = [...new Set([0, ...segmentStarts])].sort((a, b) => a - b);
    let pagesLeft = options.maxPages;
    let partial = false;
    let firstError: unknown;
    const segments: QuickShop[][] = starts.map(() => []);

    const scanSegment = async (index: number) => {
        // 次の区間の始まりまでがこの区間の受け持ち (最後の区間は終わりまで)
        const end = starts[index + 1];
        let cursor = starts[index];
        for (;;) {
            if (pagesLeft <= 0) {
                console.warn(
                    `お店の一覧が ${options.maxPages} ページを超えたため打ち切りました`,
                );
                partial = true;
                return;
            }
            pagesLeft--;
            let page: ShopPageResult;
            try {
                page = await fetchPage(cursor);
            } catch (error) {
                // 1 区間の失敗では一覧全体を捨てず、取れた分だけで出す
                console.warn(
                    `お店の一覧 (ID ${cursor} より後) を取得できません:`,
                    error,
                );
                partial = true;
                firstError ??= error;
                return;
            }
            for (const shop of page.shops) {
                if (end === undefined || shop.shopId <= end) {
                    segments[index].push(shop);
                }
            }
            const lastId = page.shops.at(-1)?.shopId;
            if (
                !page.hasMore ||
                page.nextCursor === null ||
                lastId === undefined
            ) {
                return;
            }
            // 次の区間に届いたら、その先は次の区間が取る
            if (end !== undefined && lastId >= end) {
                return;
            }
            cursor = page.nextCursor;
        }
    };

    // 少数のワーカーで区間を順に取る
    let nextIndex = 0;
    const worker = async () => {
        while (nextIndex < starts.length) {
            await scanSegment(nextIndex++);
        }
    };
    await Promise.all(
        Array.from(
            { length: Math.min(options.concurrency, starts.length) },
            worker,
        ),
    );

    // 区間の境目で重なったお店は ID で 1 件にまとめる
    const byId = new Map<number, QuickShop>();
    for (const shop of segments.flat()) {
        byId.set(shop.shopId, shop);
    }
    const shops = [...byId.values()].sort((a, b) => a.shopId - b.shopId);
    if (shops.length === 0 && firstError !== undefined) {
        // 1 件も取れなければ一覧そのものを出せない
        throw firstError instanceof Error
            ? firstError
            : new Error(String(firstError));
    }
    return { shops, partial };
}
