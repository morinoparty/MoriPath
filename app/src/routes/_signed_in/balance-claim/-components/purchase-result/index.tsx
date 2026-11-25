import { Check } from "lucide-react";
import { sva } from "../../../../../../styled-system/css";
import { formatNumber } from "../../../../../lib/format-number";
import type { ClaimPurchaseResult } from "../../-types/claim-purchase";
import { ClaimSummary } from "../claim-summary";

const purchaseResultStyle = sva({
    slots: ["root", "message", "badge", "text", "title", "used"],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "5",
            width: "full",
        },
        message: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4",
            textAlign: "center",
        },
        // ブランド色の丸の中にチェックを置く
        badge: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "72px",
            height: "72px",
            borderRadius: "full",
            bg: "colorPalette.solid",
            color: "colorPalette.contrast",
            "& > svg": { width: "36px", height: "36px" },
        },
        // 見出しと使ったどんぐりは 1 つのまとまりとして詰めて並べる
        text: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1",
        },
        title: {
            fontSize: "22px",
            fontWeight: "bold",
            lineHeight: "1.5",
            color: "colorPalette.fg",
        },
        used: {
            fontSize: "14px",
            fontWeight: "medium",
            lineHeight: "1.5",
            color: "colorPalette.fg.muted",
        },
    },
});

export interface PurchaseResultProps {
    result: ClaimPurchaseResult;
}

/** 買い終わったときの表示。買った数と使ったどんぐり、買ったあとの保護ブロックと残高を出す */
export const PurchaseResult = ({ result }: PurchaseResultProps) => {
    const style = purchaseResultStyle();
    return (
        <section className={style.root} aria-live="polite">
            <div className={style.message}>
                <span className={style.badge} aria-hidden>
                    <Check strokeWidth={2.5} />
                </span>
                <div className={style.text}>
                    <h2 className={style.title}>
                        {formatNumber(result.purchased)} ブロック買いました
                    </h2>
                    {/* 購入 API の応答が読めず使った額が分からないときは、この行を出さない */}
                    {result.totalCost !== null && (
                        <p className={style.used}>
                            {/* 単価が小数のときに備えて、使ったどんぐりは整数に丸めて出す */}
                            {formatNumber(Math.round(result.totalCost))}{" "}
                            どんぐりを使いました
                        </p>
                    )}
                </div>
            </div>
            <ClaimSummary
                remainingClaimBlocks={result.remainingClaimBlocks}
                balance={result.balance}
            />
        </section>
    );
};
