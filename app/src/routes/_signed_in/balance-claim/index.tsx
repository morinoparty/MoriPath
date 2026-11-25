import { createFileRoute } from "@tanstack/react-router";
import { getMyClaims, getVaultBalance } from "../-functions";
import { ClaimPurchaseView } from "./-components/claim-purchase-view";
import { CLAIM_BLOCK_PRICE } from "./-functions/claim-block-price";
import { useClaimPurchase } from "./-functions/use-claim-purchase";

export const Route = createFileRoute("/_signed_in/balance-claim/")({
    loader: async () => {
        // どれかが取れなくても画面は出し、取れなかった値は null にして「—」や非表示にする
        const [balance, claims] = await Promise.all([
            getVaultBalance().catch(() => null),
            getMyClaims().catch(() => null),
        ]);
        return {
            balance,
            remainingClaimBlocks: claims?.remainingClaimBlocks ?? null,
            // 単価は API が無いため、サーバーの設定に合わせた定数を使う
            unitPrice: CLAIM_BLOCK_PRICE,
        };
    },
    component: BalanceClaimPage,
});

function BalanceClaimPage() {
    const { balance, remainingClaimBlocks, unitPrice } = Route.useLoaderData();
    const purchase = useClaimPurchase({
        balance,
        remainingClaimBlocks,
        unitPrice,
    });
    return (
        <ClaimPurchaseView
            balance={balance}
            remainingClaimBlocks={remainingClaimBlocks}
            unitPrice={unitPrice}
            count={purchase.count}
            maxBlocks={purchase.maxBlocks}
            quote={purchase.quote}
            canPurchase={purchase.canPurchase}
            isPurchasing={purchase.isPurchasing}
            isRefreshing={purchase.isRefreshing}
            isConfirming={purchase.isConfirming}
            failure={purchase.failure}
            result={purchase.result}
            onCountChange={purchase.changeCount}
            onAdd={purchase.addCount}
            onFillMax={purchase.fillMax}
            onRequestConfirm={purchase.requestConfirm}
            onCancelConfirm={purchase.cancelConfirm}
            onConfirmPurchase={purchase.confirmPurchase}
            onPurchaseAgain={purchase.purchaseAgain}
        />
    );
}
