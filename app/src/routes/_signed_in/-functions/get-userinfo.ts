import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "../../../lib/auth";
import { getAuthServerUrl } from "../../../lib/server-list";
import type { UserInfoData } from "../../../types/player";

export const getUserInfo = createServerFn().handler(
    async ({ request }: any) => {
        const auth = await getAuth();
        const tokenResult = await auth.api.getAccessToken({
            body: {
                providerId: "MineAuth",
            },
            headers: request.headers,
        });

        // サーバーリストの上から順に解決した認証サーバー (MineAuth) に問い合わせる

        const authServerUrl = await getAuthServerUrl();

        const response = await fetch(`${authServerUrl}/oauth2/userinfo`, {
            headers: {
                Authorization: `Bearer ${tokenResult.accessToken}`,
            },
        });
        const data = (await response.json()) as UserInfoData;
        return data;
    },
);

export type UserInfoDataResponse = Awaited<ReturnType<typeof getUserInfo>>;
