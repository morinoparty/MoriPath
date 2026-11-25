import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import type { Decorator } from "@storybook/react";
import { toDiaryEntries } from "@/routes/_signed_in/-functions/to-diary-entries";
import { buildDiaryStripDays } from "@/routes/_signed_in/diary/-functions/diary-date";
import type { DiaryDayResult } from "@/routes/_signed_in/diary/-types/diary-day";
import { css } from "../../../styled-system/css";
import {
    sampleDiaryDocument,
    sampleFinalizedDiaryDocument,
} from "../../sample-diary";
import { craftheadAvatarUrl } from "../../sample-players";

/** もりぱダイアリーのストーリー共通の枠 (顔の取得先と、画面の地の色) */
export const withDiaryFrame: Decorator = (Story) => (
    <MinecraftProvider config={{ avatarUrl: craftheadAvatarUrl }}>
        <div
            className={css({
                maxWidth: "md",
                margin: "0 auto",
                paddingX: "6",
                paddingY: "4",
                bg: "colorPalette.bg",
                color: "colorPalette.fg",
                textStyle: "body",
            })}
        >
            <Story />
        </div>
    </MinecraftProvider>
);

/** 表示が日によって変わらないよう、今日を見本の日付に固定する */
export const sampleToday = "2026-11-25";

/** 日記のある日の見本 (今日と、いくつか抜けのある最近の日) */
export const sampleExistingDates = [
    "2026-11-25",
    "2026-11-24",
    "2026-11-23",
    "2026-11-21",
    "2026-11-20",
    "2026-11-18",
    "2026-11-17",
    "2026-11-15",
    "2026-11-14",
];

/** 締まった日 (まとめ付き) の取得結果 */
export const sampleFinalizedResult: DiaryDayResult = {
    kind: "found",
    day: {
        date: sampleFinalizedDiaryDocument.date,
        summary: sampleFinalizedDiaryDocument.summary ?? null,
        entries: toDiaryEntries(sampleFinalizedDiaryDocument),
    },
};

/** 今日 (まだ締まっていない日) の取得結果 */
export const sampleTodayResult: DiaryDayResult = {
    kind: "found",
    day: {
        date: sampleDiaryDocument.date,
        summary: null,
        entries: toDiaryEntries(sampleDiaryDocument),
    },
};

/** 見本の日付の帯 */
export const sampleStripDays = (
    selected: string,
    existingDates: string[] | null = sampleExistingDates,
) => buildDiaryStripDays({ selected, today: sampleToday, existingDates });
