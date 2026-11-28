import type {
    DailyQuestResponse,
    QuestBoard,
    QuestStatus,
} from "../-types/quest";

/** 完了フラグから進み具合を求める。報酬を受け取ったら目標の達成より優先する */
const toQuestStatus = (
    taskCompleted: boolean,
    questCompleted: boolean,
): QuestStatus => {
    if (questCompleted) {
        return "completed";
    }
    return taskCompleted ? "reportable" : "active";
};

/** プラグインのレスポンスを、クエストのページで使う形にする */
export const toQuestBoard = (response: DailyQuestResponse): QuestBoard => ({
    ordered: response.ordered,
    online: response.online,
    rerollCharges: Math.max(0, response.rerollCharges),
    // 受けていない日は、前日の記録が残っていても出さない
    quests: response.ordered
        ? [...response.dailyQuests]
              .sort((a, b) => a.slot - b.slot)
              .map((quest) => ({
                  slot: quest.slot,
                  difficulty: quest.difficulty,
                  rarity: quest.rarity,
                  title: quest.title,
                  objective: quest.objective,
                  status: toQuestStatus(
                      quest.taskCompleted,
                      quest.questCompleted,
                  ),
                  // 目標を達成したあとは 100% に固定し、念のため 0〜100 に収める
                  progressPercentage: quest.taskCompleted
                      ? 100
                      : Math.min(100, Math.max(0, quest.progressPercentage)),
                  currentAmount: quest.currentAmount,
                  totalAmount: quest.totalAmount,
              }))
        : [],
});
