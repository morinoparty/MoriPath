import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { purchaseClaimBlocks } from "../../-functions/purchase-claim-blocks";
import type {
    ClaimPurchaseFailure,
    ClaimPurchaseResult,
    PurchaseClaimBlocksResult,
} from "../-types/claim-purchase";
import {
    clampBlockCount,
    DEFAULT_BLOCK_COUNT,
    maxAffordableBlocks,
    quoteClaimPurchase,
} from "./block-count";

// サーバー関数まで届かなかったときの案内 (買えたかどうかは分からない)
const UNREACHABLE_FAILURE: ClaimPurchaseFailure = {
    kind: "unknown",
    message:
        "買えたかどうか確かめられませんでした。保護ブロックの数を確かめてから、もう一度ためしてください",
};

export interface ClaimPurchaseState {
    /** いまの残高。取れなかったときは null */
    balance: number | null;
    /** いまの保護ブロック。取れなかったときは null */
    remainingClaimBlocks: number | null;
    /** 1 ブロックのどんぐり。設定が無ければ null */
    unitPrice: number | null;
}

/**
 * /balance-claim の状態をまとめるフック。
 * 購入は useMutation で行い、画面には表示用の値と操作だけを渡す
 */
export const useClaimPurchase = (current: ClaimPurchaseState) => {
    const router = useRouter();
    const [count, setCount] = useState(DEFAULT_BLOCK_COUNT);
    const [failure, setFailure] = useState<ClaimPurchaseFailure | null>(null);
    const [result, setResult] = useState<ClaimPurchaseResult | null>(null);
    // 確認ダイアログを開いているか
    const [isConfirming, setIsConfirming] = useState(false);
    // 買ったあとに残高と保護ブロックを取り直しているあいだ。終わるまで数を変えさせない
    const [isRefreshing, setIsRefreshing] = useState(false);
    // 同じ描画のうちに 2 回押されても 1 回しか買わないための印
    const purchasingRef = useRef(false);

    const maxBlocks = maxAffordableBlocks(current.balance, current.unitPrice);
    const quote = quoteClaimPurchase(count, current);
    // 1 ブロックも買えないと分かっているときと、足りないときは買わせない。
    // 買えたか分からなかった直後も、二重に買わないよう数を選び直すまで買わせない
    const canPurchase =
        !quote.isInsufficient && maxBlocks !== 0 && failure?.kind !== "unknown";

    const purchase = useMutation({
        mutationFn: (blockCount: number) =>
            purchaseClaimBlocks({ data: { blockCount } }),
        // どんぐりが動く POST なので、失敗しても自動では送り直さない
        retry: false,
    });

    // 数を選び直したら前の失敗の案内は消す (取り直した残高と保護ブロックを見てから決め直したとみなす)
    const changeCount = (next: number) => {
        setCount(clampBlockCount(next));
        setFailure(null);
    };

    const addCount = (delta: number) => {
        changeCount(count + delta);
    };

    const fillMax = () => {
        if (maxBlocks !== null && maxBlocks > 0) {
            changeCount(maxBlocks);
        }
    };

    const requestConfirm = () => {
        // canPurchase は買えたか分からない失敗のあいだ false なので、ここで消すのは断られたときの案内だけ
        if (canPurchase) {
            setFailure(null);
            setIsConfirming(true);
        }
    };

    const cancelConfirm = () => {
        // 買っているあいだは閉じさせない (結果を見届けてから閉じる)
        if (!purchasingRef.current) {
            setIsConfirming(false);
        }
    };

    const confirmPurchase = async () => {
        if (!canPurchase || purchasingRef.current) {
            return;
        }
        purchasingRef.current = true;
        setFailure(null);
        try {
            const response: PurchaseClaimBlocksResult = await purchase
                .mutateAsync(count)
                .catch((): PurchaseClaimBlocksResult => ({
                    ok: false,
                    ...UNREACHABLE_FAILURE,
                }));
            if (response.ok) {
                setIsConfirming(false);
                setResult({
                    purchased: response.purchased,
                    totalCost: response.totalCost,
                    balance: response.balance,
                    remainingClaimBlocks: response.remainingClaimBlocks,
                });
            } else {
                // 選んだ数はそのままにして、ダイアログの中に理由だけを出す
                setFailure({ kind: response.kind, message: response.message });
            }
            // 成功時も結果が分からないときも、ホーム・マイページとこの画面の値を取り直す
            if (response.ok || response.kind === "unknown") {
                setIsRefreshing(true);
                await router.invalidate();
            }
        } finally {
            purchasingRef.current = false;
            setIsRefreshing(false);
        }
    };

    const purchaseAgain = () => {
        setCount(DEFAULT_BLOCK_COUNT);
        setResult(null);
        setFailure(null);
    };

    return {
        count,
        maxBlocks,
        quote,
        canPurchase,
        isPurchasing: purchase.isPending,
        isRefreshing,
        isConfirming,
        failure,
        result,
        changeCount,
        addCount,
        fillMax,
        requestConfirm,
        cancelConfirm,
        confirmPurchase,
        purchaseAgain,
    };
};
