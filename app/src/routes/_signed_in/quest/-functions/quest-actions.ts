import type { QuestBoard } from "../-types/quest";

/** リロールできない理由。できるときは null */
export const rerollBlockedReason = (board: QuestBoard): string | null => {
    if (!board.online) {
        return "サーバーにいるときだけリロールできます";
    }
    if (board.rerollCharges <= 0) {
        return "きょうのリロールは使い切りました";
    }
    // ゲーム内と同じく、目標を達成したクエストがあるとリロールできない
    if (board.quests.some((quest) => quest.status !== "active")) {
        return "達成したクエストがあるとリロールできません";
    }
    return null;
};
