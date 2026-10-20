import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "../../../lib/auth";
import { getServerUrl } from "../../../lib/server-list";

/** 購入 API のレスポンス型（OpenAPI 準拠） */
interface PurchaseClaimBlocksResponse {
    newBalance: number;
    purchased: number;
    remainingClaimBlocks: number;
    totalCost: number;
}

/** 呼び出し側の `{ data: { blockCount } }` を型付けするための入力定義 */
const purchaseClaimBlocksFn = createServerFn().inputValidator(
    (data: { blockCount: number }) => data,
);

/**
 * MineAuth GriefPrevention API で保護ブロックを購入する。
 * どんぐり残高から指定数分が消費される。
 */
export const purchaseClaimBlocks = purchaseClaimBlocksFn.handler(
    // biome-ignore lint/suspicious/noExplicitAny: ctx の型は createServerFn のコンテキストに依存する
    async (ctx: any) => {
        const { data, request } = ctx as {
            data: { blockCount: number };
            request: Request;
        };
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
            `${mainServerUrl}/api/v1/plugins/griefprevention/claims/purchase`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${tokenResult.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    blockCount: data.blockCount,
                }),
            },
        );

        if (!response.ok) {
            const err = (await response.json()) as {
                error?: string;
                message?: string;
            };
            throw new Error(
                err?.message ?? err?.error ?? "Failed to purchase claim blocks",
            );
        }

        const result = (await response.json()) as PurchaseClaimBlocksResponse;
        return result;
    },
);

export type PurchaseClaimBlocksData = Awaited<
    ReturnType<typeof purchaseClaimBlocks>
>;
