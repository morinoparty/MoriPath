import { z } from "zod";
import { getMineAuthAccessToken } from "../../../../lib/auth";
import { MINEAUTH_API_TIMEOUT_MS } from "../../../../lib/mineauth-timeout";
import { getServerUrl } from "../../../../lib/server-list";

// AdvanceRailway は main サーバーにだけ入っている
const API_PATH = "/api/v1/plugins/advancerailway";

// API の DTO のうち /map と乗換案内で使う項目だけを検証する
const pointSchema = z.object({ x: z.number(), z: z.number() });

export const stationDtoSchema = z.object({
    id: z.string(),
    // URL や乗換案内の引数に使う。大文字・小文字を区別する
    slug: z.string(),
    name: z.string(),
    world: z.string(),
    point: pointSchema,
    overrideSize: z.number().nullable().optional(),
    numberings: z
        .array(
            z.object({
                group: z.string(),
                groupName: z.string(),
                numbering: z.string().nullable().optional(),
                position: z.number(),
            }),
        )
        .default([]),
});

export const groupDtoSchema = z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    color: z.string(),
    // ナンバリングを付けない路線では null
    numberingPrefix: z.string().nullable().optional(),
    numberingStart: z.number().optional(),
});

export type StationDto = z.infer<typeof stationDtoSchema>;
export type GroupDto = z.infer<typeof groupDtoSchema>;

// /route の 1 区間。駅から駅への 1 本 (RAIL) か、徒歩 (WALK)
const routeLegSchema = z.object({
    mode: z.enum(["RAIL", "WALK"]),
    // 実際の応答のサンプルが無いので、null になりうる項目は省略も許す
    railway: z.string().nullable().optional(),
    railwaySlug: z.string().nullable().optional(),
    from: z.string().nullable().optional(),
    fromName: z.string().nullable().optional(),
    to: z.string(),
    toName: z.string(),
    // 秒
    timeRequired: z.number(),
    group: z.string().nullable().optional(),
    line: z.string().nullable().optional(),
});

/** GET /route?from=&to= の応答 */
export const routeResponseSchema = z.object({
    from: z.string(),
    fromName: z.string(),
    to: z.string(),
    toName: z.string(),
    // 秒
    totalTime: z.number(),
    // 通る駅の ID (出発から到着まで)
    stations: z.array(z.string()).default([]),
    legs: z.array(routeLegSchema),
});

export type RouteResponseDto = z.infer<typeof routeResponseSchema>;

export const railwayDtoSchema = z.object({
    id: z.string(),
    group: z.string().nullable().optional(),
    fromStation: z.string(),
    toStation: z.string(),
});

/** 権限が無いなど、API を使えないときに投げる (呼び出し側で null に変える) */
export class AdvanceRailwayUnavailableError extends Error {}

/** 200 以外 (401/403 を除く) の応答。status と API のエラーコード (ErrorResponse.code) を持つ */
export class AdvanceRailwayHttpError extends Error {
    constructor(
        readonly status: number,
        readonly code: string | null,
        message: string,
    ) {
        super(message);
    }
}

// MineAuth の ErrorResponse からエラーコードだけを読む
const errorResponseSchema = z.object({ code: z.string().nullish() });

/**
 * ログイン中のプレイヤーのアクセストークンで AdvanceRailway の API を呼ぶ。
 * 401 / 403 は「使えない」として AdvanceRailwayUnavailableError にする
 */
export const fetchAdvanceRailway = async <T>(
    headers: Headers,
    path: string,
    schema: z.ZodType<T>,
): Promise<T> => {
    const tokenResult = await getMineAuthAccessToken(headers);
    if (!tokenResult?.accessToken) {
        throw new AdvanceRailwayUnavailableError("No access token available");
    }
    const response = await fetch(`${getServerUrl("main")}${API_PATH}${path}`, {
        headers: { Authorization: `Bearer ${tokenResult.accessToken}` },
        signal: AbortSignal.timeout(MINEAUTH_API_TIMEOUT_MS),
    });
    if (response.status === 401 || response.status === 403) {
        throw new AdvanceRailwayUnavailableError(
            `AdvanceRailway API is not available (${response.status})`,
        );
    }
    if (!response.ok) {
        // 本文が JSON でなくてもエラーの種類が分からないだけなので、code は null にする
        const body = errorResponseSchema.safeParse(
            await response.json().catch(() => null),
        );
        throw new AdvanceRailwayHttpError(
            response.status,
            body.success ? (body.data.code ?? null) : null,
            `AdvanceRailway API failed (${response.status})`,
        );
    }
    return schema.parse(await response.json());
};

// API の 1 ページの上限
const PAGE_SIZE = 500;

const stationsResponseSchema = z.object({
    stations: z.array(stationDtoSchema),
});
const groupsResponseSchema = z.object({ groups: z.array(groupDtoSchema) });

/** ページングをたどって全件を取る */
const fetchAllPages = async <T>(
    fetchPage: (offset: number) => Promise<T[]>,
): Promise<T[]> => {
    const items: T[] = [];
    for (let offset = 0; ; offset += PAGE_SIZE) {
        const page = await fetchPage(offset);
        items.push(...page);
        if (page.length < PAGE_SIZE) {
            return items;
        }
    }
};

/**
 * AdvanceRailway の駅とグループを全件取る (/map と乗換案内で共通)。
 * API を使えないときは AdvanceRailwayUnavailableError を投げる
 */
export const fetchRailwayDtos = async (
    headers: Headers,
): Promise<{ stations: StationDto[]; groups: GroupDto[] }> => {
    const [stations, groups] = await Promise.all([
        fetchAllPages(async (offset) => {
            const page = await fetchAdvanceRailway(
                headers,
                `/stations?limit=${PAGE_SIZE}&offset=${offset}`,
                stationsResponseSchema,
            );
            return page.stations;
        }),
        fetchAllPages(async (offset) => {
            const page = await fetchAdvanceRailway(
                headers,
                `/groups?limit=${PAGE_SIZE}&offset=${offset}`,
                groupsResponseSchema,
            );
            return page.groups;
        }),
    ]);
    return { stations, groups };
};
