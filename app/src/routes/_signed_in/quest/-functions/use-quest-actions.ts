import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { showToast } from "../../../../components/toaster";
import type { OrderableDifficulty, QuestActionResult } from "../-types/quest";
import { orderDailyQuests } from "./order-daily-quests";
import { DIFFICULTY_LABELS } from "./quest-difficulty";
import { UNREACHABLE_MESSAGE } from "./quest-messages";
import { rerollDailyQuests } from "./reroll-daily-quests";

// サーバー関数そのものが落ちたときの結果 (通信の失敗など)
const unreachable = (): QuestActionResult => ({
    ok: false,
    message: UNREACHABLE_MESSAGE,
});

/**
 * クエストのページの操作 (受注・リロール)。
 * 結果は toast で知らせ、成功したら loader を取り直して画面を最新にする
 */
export const useQuestActions = () => {
    const router = useRouter();
    // リロールの確認ダイアログを開いているか
    const [isConfirmingReroll, setIsConfirmingReroll] = useState(false);

    const order = useMutation({
        mutationFn: (difficulty: OrderableDifficulty) =>
            orderDailyQuests({ data: { difficulty } }),
    });
    const reroll = useMutation({
        mutationFn: () => rerollDailyQuests(),
    });

    /** 難易度を選んでクエストを受ける */
    const orderQuests = async (difficulty: OrderableDifficulty) => {
        if (order.isPending) {
            return;
        }
        const result = await order.mutateAsync(difficulty).catch(unreachable);
        if (result.ok) {
            showToast({
                type: "success",
                title: `${DIFFICULTY_LABELS[difficulty]}のクエストを受けました`,
            });
        } else {
            showToast({ type: "error", title: result.message });
        }
        // 断られたときも、ほかの端末やゲーム内で受けた可能性があるため取り直す
        await router.invalidate();
    };

    /** 確認のうえでリロールする */
    const confirmReroll = async () => {
        if (reroll.isPending) {
            return;
        }
        const result = await reroll.mutateAsync().catch(unreachable);
        setIsConfirmingReroll(false);
        if (result.ok) {
            showToast({ type: "success", title: "難易度を選び直せます" });
        } else {
            showToast({ type: "error", title: result.message });
        }
        await router.invalidate();
    };

    return {
        orderingDifficulty: order.isPending ? order.variables : null,
        isRerolling: reroll.isPending,
        isConfirmingReroll,
        orderQuests,
        requestReroll: () => setIsConfirmingReroll(true),
        cancelReroll: () => {
            // リロール中は結果を見届けるまで閉じさせない
            if (!reroll.isPending) {
                setIsConfirmingReroll(false);
            }
        },
        confirmReroll,
    };
};
