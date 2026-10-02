import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "../../../lib/auth";
import { getAuthServerUrl } from "../../../lib/server-list";

interface VaultBalanceResponse {
    balance: number;
}

export const getVaultBalance = createServerFn().handler(
    // biome-ignore lint/suspicious/noExplicitAny: request is not typed
    async ({ request }: any) => {
        const auth = await getAuth();
        const tokenResult = await auth.api.getAccessToken({
            body: {
                providerId: "MineAuth",
            },
            headers: request.headers,
        });

        if (!tokenResult?.accessToken) {
            throw new Error("No access token available");
        }

        // サーバーリストの上から順に解決した認証サーバー (MineAuth) に問い合わせる

        const authServerUrl = await getAuthServerUrl();

        const response = await fetch(
            `${authServerUrl}/api/v1/plugins/vault/balance/me`,
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
