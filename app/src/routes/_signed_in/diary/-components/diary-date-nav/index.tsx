import { IconButton } from "@morinoparty/chlorophyll-react/components";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { sva } from "../../../../../../styled-system/css";
import { addDays, formatDiaryDate } from "../../-functions/diary-date";

const diaryDateNavStyle = sva({
    slots: ["root", "label", "date", "today"],
    base: {
        root: {
            display: "flex",
            alignItems: "center",
            gap: "2",
        },
        label: {
            flex: "1",
            minWidth: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2",
        },
        date: {
            textStyle: "lg",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        today: {
            paddingX: "2",
            paddingY: "0.5",
            borderRadius: "full",
            textStyle: "xs",
            fontWeight: "bold",
            bg: "colorPalette.solid",
            color: "colorPalette.contrast",
        },
    },
});

export interface DiaryDateNavProps {
    /** いま開いている日 (YYYY-MM-DD) */
    date: string;
    /** 今日 (日本時間 4 時で切り替わる日付) */
    today: string;
    /** 「次の日」で進める最後の日 (最新の日記の日) */
    lastDate: string;
    /** 「前の日」を押せるか (最初の日記より前は遡れない) */
    canGoBack: boolean;
}

/** 前の日・次の日のボタンと、いま開いている日付 */
export const DiaryDateNav = ({
    date,
    today,
    lastDate,
    canGoBack,
}: DiaryDateNavProps) => {
    const style = diaryDateNavStyle();
    // 最新の日より先には進めない
    const nextDate = date < lastDate ? addDays(date, 1) : null;

    return (
        <nav className={style.root} aria-label="日付の移動">
            {canGoBack ? (
                <IconButton asChild variant="ghost" aria-label="前の日">
                    <Link to="/diary/$date" params={{ date: addDays(date, -1) }}>
                        <ChevronLeft />
                    </Link>
                </IconButton>
            ) : (
                <IconButton variant="ghost" aria-label="前の日" disabled>
                    <ChevronLeft />
                </IconButton>
            )}
            <p className={style.label}>
                <time dateTime={date} className={style.date}>
                    {formatDiaryDate(date, today)}
                </time>
                {date === today && <span className={style.today}>今日</span>}
            </p>
            {nextDate ? (
                <IconButton asChild variant="ghost" aria-label="次の日">
                    <Link to="/diary/$date" params={{ date: nextDate }}>
                        <ChevronRight />
                    </Link>
                </IconButton>
            ) : (
                <IconButton variant="ghost" aria-label="次の日" disabled>
                    <ChevronRight />
                </IconButton>
            )}
        </nav>
    );
};
