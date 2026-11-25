import { createServerFn } from "@tanstack/react-start";
import { getMineAuthAccessToken } from "../../../lib/auth";
import { fetchVaultBalance } from "./fetch-vault-balance";

export const getVaultBalance = createServerFn().handler(
    // oxlint-disable-next-line typescript/no-explicit-any -- request is not typed
    async ({ request }: any) => {
        const tokenResult = await getMineAuthAccessToken(request.headers);

        if (!tokenResult?.accessToken) {
            throw new Error("No access token available");
        }

        return fetchVaultBalance(tokenResult.accessToken);
    },
);

export type VaultBalanceData = Awaited<ReturnType<typeof getVaultBalance>>;
