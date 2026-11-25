import { z } from "zod";
import { getAuth } from "../../../../lib/auth";
import { getServerUrl } from "../../../../lib/server-list";

// AdvanceRailway は main サーバーにだけ入っている
const API_PATH = "/api/v1/plugins/advancerailway";

// API の DTO のうち /map で使う項目だけを検証する
const pointSchema = z.object({ x: z.number(), z: z.number() });

export const stationDtoSchema = z.object({
    id: z.string(),
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
    name: z.string(),
    color: z.string(),
});

export const railwayDtoSchema = z.object({
    id: z.string(),
    group: z.string().nullable().optional(),
    fromStation: z.string(),
    toStation: z.string(),
});

/** 権限が無いなど、API を使えないときに投げる (呼び出し側で null に変える) */
export class AdvanceRailwayUnavailableError extends Error {}

/**
 * ログイン中のプレイヤーのアクセストークンで AdvanceRailway の API を呼ぶ。
 * 401 / 403 は「使えない」として AdvanceRailwayUnavailableError にする
 */
export const fetchAdvanceRailway = async <T>(
    headers: Headers,
    path: string,
    schema: z.ZodType<T>,
): Promise<T> => {
    const auth = await getAuth();
    const tokenResult = await auth.api.getAccessToken({
        body: { useAccountCookie: true },
        headers,
    });
    if (!tokenResult?.accessToken) {
        throw new AdvanceRailwayUnavailableError("No access token available");
    }
    const response = await fetch(`${getServerUrl("main")}${API_PATH}${path}`, {
        headers: { Authorization: `Bearer ${tokenResult.accessToken}` },
    });
    if (response.status === 401 || response.status === 403) {
        throw new AdvanceRailwayUnavailableError(
            `AdvanceRailway API is not available (${response.status})`,
        );
    }
    if (!response.ok) {
        throw new Error(`AdvanceRailway API failed (${response.status})`);
    }
    return schema.parse(await response.json());
};
