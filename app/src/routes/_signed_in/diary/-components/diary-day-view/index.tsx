import { sva } from "../../../../../../styled-system/css";
import { SubPageBar } from "../../../../../components/sub-page-bar";
import type { DiaryDayResult, DiaryStripDay } from "../../-types/diary-day";
import { DiaryDateNav } from "../diary-date-nav";
import { DiaryDayStrip } from "../diary-day-strip";
import {
    DiaryDayTimeline,
    DiaryDayTimelineSkeleton,
} from "../diary-day-timeline";

// 戻るボタンの行き先 (「きょうのもりぱダイアリー」のあるホーム)
const BACK_TO = "/";

const diaryDayViewStyle = sva({
    slots: ["root", "dates"],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "5",
            minHeight: "100dvh",
            paddingX: "6",
            paddingTop: "4",
            paddingBottom:
                "max({spacing.8}, calc(env(safe-area-inset-bottom) + {spacing.4}))",
            bg: "colorPalette.bg",
        },
        // 日付の移動と帯はひとまとまりに見せる
        dates: {
            display: "flex",
            flexDirection: "column",
            gap: "3",
        },
    },
});

export interface DiaryDayViewProps {
    /** いま開いている日 (YYYY-MM-DD) */
    date: string;
    /** 今日 (日本時間 4 時で切り替わる日付) */
    today: string;
    /** 「次の日」で進める最後の日 */
    lastDate: string;
    /** 「前の日」を押せるか (最初の日記より前は遡れない) */
    canGoBack: boolean;
    /** その日のダイアリー。null なら読み込み中で、タイムラインだけ場所取りを出す */
    result: DiaryDayResult | null;
    /** 日付の帯に並べる日 (古い順) */
    stripDays: DiaryStripDay[];
}

/** もりぱダイアリーの 1 日分の画面。日付の移動・帯・その日のタイムラインを縦に並べる */
export const DiaryDayView = ({
    date,
    today,
    lastDate,
    canGoBack,
    result,
    stripDays,
}: DiaryDayViewProps) => {
    const style = diaryDayViewStyle();
    return (
        <div className={style.root}>
            <SubPageBar title="もりぱダイアリー" backTo={BACK_TO} />
            <div className={style.dates}>
                <DiaryDateNav
                    date={date}
                    today={today}
                    lastDate={lastDate}
                    canGoBack={canGoBack}
                />
                <DiaryDayStrip days={stripDays} selected={date} />
            </div>
            {result ? (
                <DiaryDayTimeline result={result} />
            ) : (
                <DiaryDayTimelineSkeleton />
            )}
        </div>
    );
};
