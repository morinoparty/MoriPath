import { createServerFn } from "@tanstack/react-start";
import { getMineAuthAccessToken } from "../../../lib/auth";
import { MINEAUTH_API_TIMEOUT_MS } from "../../../lib/mineauth-timeout";
import { getServerUrl } from "../../../lib/server-list";

// oxlint-disable-next-line typescript/no-explicit-any -- レスポンス構造が未定義
export type QuestsResponse = any;

export const getQuests = createServerFn().handler(
    // oxlint-disable-next-line typescript/no-explicit-any -- request is not typed
    async ({ request }: any) => {
        const tokenResult = await getMineAuthAccessToken(request.headers);

        if (!tokenResult?.accessToken) {
            throw new Error("No access token available");
        }

        const response = await fetch(
            `${getServerUrl("res")}/api/v1/plugins/betonquest-dailyquest-mineauth-integration/daily-quests/me`,
            {
                headers: {
                    Authorization: `Bearer ${tokenResult.accessToken}`,
                },
                signal: AbortSignal.timeout(MINEAUTH_API_TIMEOUT_MS),
            },
        );

        if (!response.ok) {
            throw new Error("Failed to fetch quests");
        }

        const data = (await response.json()) as QuestsResponse;
        return data;
    },
);

export type QuestsData = Awaited<ReturnType<typeof getQuests>>;
