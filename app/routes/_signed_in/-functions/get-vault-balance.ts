import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { auth } from "../../../lib/auth";

interface VaultBalanceResponse {
    balance: number;
}

export const getVaultBalance = createServerFn().handler(
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

        const response = await fetch(
            `${env.MAIN_SERVER_URL}/api/v1/plugins/vault/balance/me`,
            {
                headers: {
                    Authorization: `Bearer ${tokenResult.accessToken}`,
                },
            },
        );

        if (!response.ok) {
            throw new Error("Failed to fetch vault balance");
        }

        const data = (await response.json()) as VaultBalanceResponse;
        return Math.round(data.balance);
    },
);

export type VaultBalanceData = Awaited<ReturnType<typeof getVaultBalance>>;
