import { css } from "../../../../../styled-system/css";
import type { QuestDifficulty } from "../-types/quest";

// 難易度ごとの colorPalette 切り替えクラス。ゲーム内のクエストカラー (緑・黄・赤・紫) に近いパレットを当てる。
// panda は css() のリテラルを静的解析して CSS を作るため、変数を渡さず難易度ごとに css() を呼んでおく
export const DIFFICULTY_PALETTE_CLASS: Record<QuestDifficulty, string> = {
    easy: css({ colorPalette: "mori" }),
    normal: css({ colorPalette: "yellow" }),
    hard: css({ colorPalette: "red" }),
    event: css({ colorPalette: "blue" }),
    unknown: css({ colorPalette: "gray" }),
};
