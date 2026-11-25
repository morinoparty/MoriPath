import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";

/**
 * 保護ブロック 1 つのどんぐり (GriefPrevention の ClaimBlocksPurchaseCost)。
 * MineAuth に単価を返す API が無いため、サーバーの環境変数 CLAIM_BLOCK_PRICE から読む。
 * 値はサーバーの設定と別に持つ写しなので、画面では「目安」として出し、実際の額は購入 API の totalCost を出す。
 * 未設定や正の数でないときは null を返し、画面は合計や「最大」を出さず、確認ダイアログで額が買ったあとに分かることを伝える。
 * cloudflare.config.ts にはまだ宣言していない (宣言には正しい値が要るため)。値が決まったら bindings.text で宣言する
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
