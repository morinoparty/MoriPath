import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "../../../lib/auth";
import { getServerUrl } from "../../../lib/server-list";

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

        // プラグイン (GriefPrevention / Vault) は main サーバーにのみ存在するため固定で問い合わせる
        const mainServerUrl = getServerUrl("main");

        const response = await fetch(
            `${mainServerUrl}/api/v1/plugins/vault/balance/me`,
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
