import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { auth } from "../../../lib/auth";

// クエスト情報のレスポンス型（実際のレスポンス構造に応じて調整が必要）
// biome-ignore lint/suspicious/noExplicitAny: レスポンス構造が不明なためanyを使用
export type QuestsResponse = any;

export const getQuests = createServerFn().handler(
    // biome-ignore lint/suspicious/noExplicitAny: request is not typed
    async ({ request }: any) => {
        const tokenResult = await auth.api.getAccessToken({
            body: {
                providerId: "MineAuth",
            },
            headers: request.headers,
        });

        if (!tokenResult?.accessToken) {
            throw new Error("No access token available");
        }

        //再起動終わりました ご協力ありがとうございました
        const response = await fetch(
            `${env.SERVER_URL}res/api/v1/plugins/betonquest-dailyquest-mineauth-integration/daily-quests/me`,
            // `http://127.0.0.1:51123/api/v1/plugins/mineauth-betonquest-addon/quests/me`,
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
