import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";

/**
 * 保護ブロック 1 つのどんぐり (GriefPrevention の ClaimBlocksPurchaseCost)。
 * MineAuth に単価を返す API が無いため、サーバーの環境変数 CLAIM_BLOCK_PRICE から読む。
 * 未設定や正の数でないときは null を返し、画面は合計や「最大」を出さない
 */
export const getClaimBlockPrice = createServerFn().handler(
    async (): Promise<number | null> => {
        // 任意の設定なので、宣言の無い環境でも落ちないよう unknown として読む
        const raw = (env as unknown as Record<string, unknown>)
            .CLAIM_BLOCK_PRICE;
        // 文字列 (secret / text) と数値 (JSON の var) のどちらでも受け付ける
        if (
            typeof raw === "string"
                ? raw.trim() === ""
                : typeof raw !== "number"
        ) {
            return null;
        }
        const price = Number(raw);
        return Number.isFinite(price) && price > 0 ? price : null;
    },
);
