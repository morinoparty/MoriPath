import { getServerUrl } from "../../../lib/server-list";

interface VaultBalanceResponse {
    balance: number;
}

/** アクセストークンで自分の Vault 残高 (どんぐり) を取る。失敗したら例外にする */
export async function fetchVaultBalance(accessToken: string): Promise<number> {
    // GriefPrevention / Vault は main サーバーにのみ存在する
    const mainServerUrl = getServerUrl("main");

    const response = await fetch(
        `${mainServerUrl}/api/v1/plugins/vault/balance/me`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!response.ok) {
        throw new Error("Failed to fetch vault balance");
    }

    const data = (await response.json()) as VaultBalanceResponse;
    // 小数の残高を四捨五入すると持っている以上の額を見せてしまうため、切り捨てる
    return Math.floor(data.balance);
}
