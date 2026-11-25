import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAuth } from "../../../lib/auth";
import { getServerUrl } from "../../../lib/server-list";
import type { PurchaseClaimBlocksResult } from "../balance-claim/-types/claim-purchase";

const purchaseClaimBlocksInputSchema = z.object({
    // API は int32 で受けるため、1 以上の整数でその範囲に収まるものだけを通す
    blockCount: z.number().int().positive().max(2_147_483_647),
});

// 購入 API の成功時の応答
const purchaseResponseSchema = z.object({
    newBalance: z.number(),
    purchased: z.number(),
    remainingClaimBlocks: z.number(),
    totalCost: z.number(),
});

// 失敗時の本文は形が決まっていないため、読めたら message / error を使う
const errorBodySchema = z.object({
    message: z.string().optional(),
    error: z.string().optional(),
});

/** 失敗時の本文からメッセージを取り出す。JSON でなければ null */
const readErrorMessage = async (response: Response): Promise<string | null> => {
    try {
        const parsed = errorBodySchema.safeParse(await response.json());
        return parsed.success
            ? (parsed.data.message ?? parsed.data.error ?? null)
            : null;
    } catch {
        return null;
    }
};

// 買えたかどうか分からないときの案内。二重購入を避けるため、再購入ではなく数の確認を促す
const UNKNOWN_MESSAGE =
    "買えたかどうか確かめられませんでした。保護ブロックの数を確かめてから、もう一度ためしてください";

/**
 * どんぐり残高を消費して保護ブロックを購入する。
 * 失敗は例外にせず、API がはっきり断ったもの (rejected) と結果が分からないもの (unknown) に分けて返す。
 * POST は自動で再送しない
 */
export const purchaseClaimBlocks = createServerFn({ method: "POST" })
    .validator(purchaseClaimBlocksInputSchema)
    .handler(
        // oxlint-disable-next-line typescript/no-explicit-any -- request は createServerFn のコンテキストで型が付かない
        async ({ data, request }: any): Promise<PurchaseClaimBlocksResult> => {
            const { blockCount } = data as z.infer<
                typeof purchaseClaimBlocksInputSchema
            >;

            // 買う前の認証はまだ何も動いていないため、失敗したら rejected として返す
            let accessToken: string;
            try {
                const auth = await getAuth();
                const tokenResult = await auth.api.getAccessToken({
                    body: { useAccountCookie: true },
                    headers: (request as Request).headers,
                });
                if (!tokenResult?.accessToken) {
                    throw new Error("No access token available");
                }
                accessToken = tokenResult.accessToken;
            } catch (error) {
                console.error("保護ブロック購入前の認証に失敗しました:", error);
                return {
                    ok: false,
                    kind: "rejected",
                    message: "ログインを確かめられませんでした",
                };
            }

            // GriefPrevention / Vault は main サーバーにのみ存在する
            const mainServerUrl = getServerUrl("main");

            let response: Response;
            try {
                response = await fetch(
                    `${mainServerUrl}/api/v1/plugins/griefprevention/claims/purchase`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ blockCount }),
                    },
                );
            } catch (error) {
                // 送信の途中で切れたときは、API に届いたかどうか分からない
                console.error(
                    "保護ブロック購入 API への通信に失敗しました:",
                    error,
                );
                return { ok: false, kind: "unknown", message: UNKNOWN_MESSAGE };
            }

            if (response.ok) {
                const parsed = purchaseResponseSchema.safeParse(
                    await response.json().catch(() => null),
                );
                if (!parsed.success) {
                    // 2xx なので買えてはいるが、買ったあとの値が読めない
                    return {
                        ok: false,
                        kind: "unknown",
                        message: UNKNOWN_MESSAGE,
                    };
                }
                return {
                    ok: true,
                    purchased: parsed.data.purchased,
                    totalCost: parsed.data.totalCost,
                    // 残高は小数で返るため、画面と同じく整数に丸める
                    balance: Math.round(parsed.data.newBalance),
                    remainingClaimBlocks: parsed.data.remainingClaimBlocks,
                };
            }

            // 5xx は途中まで処理された可能性があるため、結果が分からない扱いにする
            if (response.status >= 500) {
                return { ok: false, kind: "unknown", message: UNKNOWN_MESSAGE };
            }
            return {
                ok: false,
                kind: "rejected",
                message:
                    (await readErrorMessage(response)) ??
                    "購入できませんでした",
            };
        },
    );

export type PurchaseClaimBlocksData = PurchaseClaimBlocksResult;
