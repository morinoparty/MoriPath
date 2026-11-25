import type { z } from "zod";
import { getMineAuthAccessToken } from "../../../../../lib/auth";
import { MINEAUTH_API_TIMEOUT_MS } from "../../../../../lib/mineauth-timeout";
import { getServerUrl } from "../../../../../lib/server-list";
import {
    ticketCommentListResponseSchema,
    type TicketCommentResponse,
    ticketListResponseSchema,
    type TicketResponse,
} from "../-types/ticket";

// 1 ページの件数。API の上限 (MAX_LIMIT) に合わせ、ページをめくる回数を減らす
const PAGE_LIMIT = 200;
// ページをめくる上限。API の不具合で終わらなくなっても、ここで打ち切る
const MAX_PAGES = 10;

/** API がはっきり見つからない (404) か、見る権限が無い (403) と答えたとき */
export class TicketNotFoundError extends Error {}

/** moripautils の API を呼ぶための接続先とアクセストークン (サーバー専用) */
export interface TicketApi {
    baseUrl: string;
    accessToken: string;
}

/** サーバー関数の中で、moripautils の API を呼ぶための情報を用意する */
export const getTicketApi = async (headers: Headers): Promise<TicketApi> => {
    const tokenResult = await getMineAuthAccessToken(headers);
    if (!tokenResult?.accessToken) {
        throw new Error("No access token available");
    }
    return {
        // moripautils のチケットは main サーバーの MineAuth にだけある
        baseUrl: `${getServerUrl("main")}/api/v1/plugins/moripautils`,
        accessToken: tokenResult.accessToken,
    };
};

/** GET して JSON をスキーマで確かめる。404 / 403 は TicketNotFoundError にする */
export const fetchTicketJson = async <Schema extends z.ZodType>(
    api: TicketApi,
    path: string,
    schema: Schema,
): Promise<z.infer<Schema>> => {
    const response = await fetch(`${api.baseUrl}${path}`, {
        headers: { Authorization: `Bearer ${api.accessToken}` },
        signal: AbortSignal.timeout(MINEAUTH_API_TIMEOUT_MS),
    });
    // 他人のチケットは /me では 404、スタッフ用の API では 403 になる
    if (response.status === 404 || response.status === 403) {
        throw new TicketNotFoundError(`Ticket API ${path}: ${response.status}`);
    }
    if (!response.ok) {
        throw new Error(`Ticket API ${path} failed: ${response.status}`);
    }
    return schema.parse(await response.json());
};

/** cursor でページをめくり、全ページの要素をつなげて返す (古い順のまま) */
const fetchAllPages = async <Item>(
    fetchPage: (cursor: number | null) => Promise<{
        items: Item[];
        hasMore: boolean;
        nextCursor: number | null;
    }>,
): Promise<Item[]> => {
    const items: Item[] = [];
    let cursor: number | null = null;
    for (let page = 0; page < MAX_PAGES; page++) {
        const result = await fetchPage(cursor);
        items.push(...result.items);
        if (!result.hasMore || result.nextCursor === null) {
            break;
        }
        cursor = result.nextCursor;
    }
    return items;
};

/** cursor と limit をクエリ文字列にする */
const pageQuery = (cursor: number | null): string => {
    const params = new URLSearchParams({ limit: String(PAGE_LIMIT) });
    if (cursor !== null) {
        params.set("cursor", String(cursor));
    }
    return `?${params.toString()}`;
};

/** 自分のチケットをすべて取得する (古い順) */
export const fetchMyTickets = (api: TicketApi): Promise<TicketResponse[]> =>
    fetchAllPages(async (cursor) => {
        const data = await fetchTicketJson(
            api,
            `/me/tickets${pageQuery(cursor)}`,
            ticketListResponseSchema,
        );
        return {
            items: data.tickets,
            hasMore: data.hasMore,
            nextCursor: data.nextCursor ?? null,
        };
    });

/**
 * チケットのコメントをすべて取得する (古い順)。
 * 自分のチケットは /me の API、そうでなければスタッフ用の API を使う
 */
export const fetchTicketComments = (
    api: TicketApi,
    ticketId: number,
    scope: "me" | "staff",
): Promise<TicketCommentResponse[]> => {
    const basePath =
        scope === "me"
            ? `/me/tickets/${ticketId}/comments`
            : `/tickets/${ticketId}/comments`;
    return fetchAllPages(async (cursor) => {
        const data = await fetchTicketJson(
            api,
            `${basePath}${pageQuery(cursor)}`,
            ticketCommentListResponseSchema,
        );
        return {
            items: data.comments,
            hasMore: data.hasMore,
            nextCursor: data.nextCursor ?? null,
        };
    });
};
