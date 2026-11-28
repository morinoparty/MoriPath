import type { Decorator } from "@storybook/react";
import type {
    DailyQuest,
    QuestBoard,
} from "@/routes/_signed_in/quest/-types/quest";
import { css } from "../../../styled-system/css";

/** クエストのストーリー共通の枠 (画面の地の色を敷く) */
export const withQuestFrame: Decorator = (Story) => (
    <div
        className={css({
            maxWidth: "md",
            margin: "0 auto",
            padding: "4",
            bg: "colorPalette.bg",
            color: "colorPalette.fg",
            textStyle: "body",
        })}
    >
        <Story />
    </div>
);

/** 何もしない操作。ストーリーでは状態を args で切り替える */
export const noop = () => {};

/** NotEnoughQuest-QuestFiles にあるクエストを元にした見本 */
export const sampleQuests = {
    // Easy の木こり。進めている途中
    foraging: {
        slot: 0,
        difficulty: "easy",
        rarity: null,
        title: "木こり・みならい",
        objective: "いずれかの原木を16個伐採する",
        status: "active",
        progressPercentage: 50,
        currentAmount: 8,
        totalAmount: 16,
    },
    // Normal の採掘。目標を達成して報告待ち
    mining: {
        slot: 1,
        difficulty: "normal",
        rarity: null,
        title: "鉄の採掘をてつだって！",
        objective: "鉄の原石を24個採掘する",
        status: "reportable",
        progressPercentage: 100,
        currentAmount: 24,
        totalAmount: 24,
    },
    // Hard のレア。報酬を受け取り済み
    debris: {
        slot: 2,
        difficulty: "hard",
        rarity: "rare",
        title: "アップグレードの時期",
        objective: "古代の残骸を4個採掘する",
        status: "completed",
        progressPercentage: 100,
        currentAmount: 4,
        totalAmount: 4,
    },
} satisfies Record<string, DailyQuest>;

/** 受けたばかりの、すべて進めている途中の日 */
export const sampleActiveBoard: QuestBoard = {
    ordered: true,
    online: true,
    rerollCharges: 1,
    quests: [
        sampleQuests.foraging,
        {
            ...sampleQuests.mining,
            status: "active",
            progressPercentage: 25,
            currentAmount: 6,
        },
        {
            ...sampleQuests.debris,
            status: "active",
            progressPercentage: 0,
            currentAmount: 0,
        },
    ],
};

/** 進み具合がばらばらの日 */
export const sampleMixedBoard: QuestBoard = {
    ordered: true,
    online: true,
    rerollCharges: 1,
    quests: [sampleQuests.foraging, sampleQuests.mining, sampleQuests.debris],
};

/** まだ受けていない日 */
export const sampleUnorderedBoard: QuestBoard = {
    ordered: false,
    online: true,
    rerollCharges: 1,
    quests: [],
};
