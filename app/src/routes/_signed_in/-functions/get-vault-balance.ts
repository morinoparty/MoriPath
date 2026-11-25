import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "../../../lib/auth";
import { fetchVaultBalance } from "./fetch-vault-balance";

export const getVaultBalance = createServerFn().handler(
    // oxlint-disable-next-line typescript/no-explicit-any -- request is not typed
    async ({ request }: any) => {
        const auth = await getAuth();
        const tokenResult = await auth.api.getAccessToken({
            body: { useAccountCookie: true },
            headers: request.headers,
        });

        if (!tokenResult?.accessToken) {
            throw new Error("No access token available");
        }

        return fetchVaultBalance(tokenResult.accessToken);
    },
);

export type VaultBalanceData = Awaited<ReturnType<typeof getVaultBalance>>;
