import { createServerFn } from "@tanstack/react-start";
import { getMineAuthAccessToken } from "../../../lib/auth";
import { MINEAUTH_API_TIMEOUT_MS } from "../../../lib/mineauth-timeout";
import { getAuthServerUrl } from "../../../lib/server-list";
import type { UserInfoData } from "../../../types/player";

export const getUserInfo = createServerFn().handler(
    async ({ request }: any) => {
        const tokenResult = await getMineAuthAccessToken(request.headers);

        const authServerUrl = await getAuthServerUrl();

        const response = await fetch(`${authServerUrl}/oauth2/userinfo`, {
            headers: {
                Authorization: `Bearer ${tokenResult.accessToken}`,
            },
            signal: AbortSignal.timeout(MINEAUTH_API_TIMEOUT_MS),
        });
        const data = (await response.json()) as UserInfoData;
        return data;
    },
);

export type UserInfoDataResponse = Awaited<ReturnType<typeof getUserInfo>>;
