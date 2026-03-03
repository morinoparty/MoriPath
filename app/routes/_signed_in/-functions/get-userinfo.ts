import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { auth } from "../../../lib/auth";
import type { UserInfoData } from "../../../types/player";

export const getUserInfo = createServerFn().handler(
    async ({ request }: any) => {
        const tokenResult = await auth.api.getAccessToken({
            body: {
                providerId: "MineAuth",
            },
            headers: request.headers,
        });

        const response = await fetch(`${env.MAIN_SERVER_URL}/oauth2/userinfo`, {
            headers: {
                Authorization: `Bearer ${tokenResult.accessToken}`,
            },
        });
        const data = (await response.json()) as UserInfoData;
        return data;
    },
);

export type UserInfoDataResponse = Awaited<ReturnType<typeof getUserInfo>>;
