import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { toDashedUuid } from "../../../../../lib/player-helpers";
import { getServerUrl } from "../../../../../lib/server-list";
import type { SendDonguriResult } from "../-types/wallet-send";
import { getWalletAuth, isSelf } from "./wallet-auth";

const sendDonguriInputSchema = z.object({
    // 送り先の UUID。ハイフンの有無を吸収し、UUID の形でなければ弾く
    target: z
        .string()
        .transform((value) => toDashedUuid(value))
        .pipe(z.string()),
    // 1 以上の整数だけを送れる (残高以下かは API に送る前に確かめる)
    amount: z.number().int().positive().max(999_999_999),
});

// 送金 API の成功時の応答 (amount / balance 以外は表示に使わない)
const sendResponseSchema = z.object({
    amount: z.number(),
    balance: z.number(),
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

// 届いたかどうか分からないときの案内。二重送金を避けるため、再送ではなく残高の確認を促す
const UNKNOWN_MESSAGE =
    "送れたかどうか確かめられませんでした。残高を確かめてから、もう一度ためしてください";

/**
 * どんぐりをほかのプレイヤーに送る。
 * 失敗は例外にせず、API がはっきり断ったもの (rejected) と結果が分からないもの (unknown) に分けて返す。
 * POST は自動で再送しない
 */
export const sendDonguri = createServerFn({ method: "POST" })
    .validator(sendDonguriInputSchema)
    .handler(
        // oxlint-disable-next-line typescript/no-explicit-any -- request は createServerFn のコンテキストで型が付かない
        async ({ data, request }: any): Promise<SendDonguriResult> => {
            const { target, amount } = data as z.infer<
                typeof sendDonguriInputSchema
            >;
            // 送る前の確認はまだ何も動いていないため、失敗したら rejected として返す
            let accessToken: string;
            try {
                const walletAuth = await getWalletAuth(
                    (request as Request).headers,
                );
                if (isSelf(walletAuth.self, { id: target })) {
                    return {
                        ok: false,
                        kind: "rejected",
                        message: "自分には送れません",
                    };
                }
                accessToken = walletAuth.accessToken;
            } catch (error) {
                console.error("送金前の認証に失敗しました:", error);
                return {
                    ok: false,
                    kind: "rejected",
                    message: "ログインを確かめられませんでした",
                };
            }

            // GriefPrevention / Vault は main サーバーにのみ存在する
            const mainServerUrl = getServerUrl("main");
            const authorization = { Authorization: `Bearer ${accessToken}` };

            // 残高を超える送金は API に送る前に断る。残高が取れなくても API 側で確かめられるので続ける
            const balance = await fetch(
                `${mainServerUrl}/api/v1/plugins/vault/balance/me`,
                { headers: authorization },
            )
                .then((response) =>
                    response.ok
                        ? (response.json() as Promise<{ balance: number }>)
                        : null,
                )
                .catch(() => null);
            if (balance && amount > balance.balance) {
                return {
                    ok: false,
                    kind: "rejected",
                    message: "残高が足りません",
                };
            }

            let response: Response;
            try {
                response = await fetch(
                    `${mainServerUrl}/api/v1/plugins/vault/send`,
                    {
                        method: "POST",
                        headers: {
                            ...authorization,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ amount, target }),
                    },
                );
            } catch (error) {
                // 送信の途中で切れたときは、API に届いたかどうか分からない
                console.error("送金 API への通信に失敗しました:", error);
                return { ok: false, kind: "unknown", message: UNKNOWN_MESSAGE };
            }

            if (response.ok) {
                const parsed = sendResponseSchema.safeParse(
                    await response.json().catch(() => null),
                );
                if (!parsed.success) {
                    // 2xx なので送れてはいるが、送金後の残高が読めない
                    return {
                        ok: false,
                        kind: "unknown",
                        message: UNKNOWN_MESSAGE,
                    };
                }
                return {
                    ok: true,
                    amount: parsed.data.amount,
                    balance: Math.round(parsed.data.balance),
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
                    (await readErrorMessage(response)) ?? "送れませんでした",
            };
        },
    );
