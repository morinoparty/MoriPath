import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "../../../lib/auth";
import { getServerUrl } from "../../../lib/server-list";

// biome-ignore lint/suspicious/noExplicitAny: レスポンス構造が未定義
export type QuestsResponse = any;

export const getQuests = createServerFn().handler(
    // biome-ignore lint/suspicious/noExplicitAny: request is not typed
    async ({ request }: any) => {
        const auth = await getAuth();
        const tokenResult = await auth.api.getAccessToken({
            body: { useAccountCookie: true },
            headers: request.headers,
        });

        if (!tokenResult?.accessToken) {
            throw new Error("No access token available");
        }

        const response = await fetch(
            `${getServerUrl("res")}/api/v1/plugins/betonquest-dailyquest-mineauth-integration/daily-quests/me`,
            {
                headers: {
                    Authorization: `Bearer ${tokenResult.accessToken}`,
                },
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
