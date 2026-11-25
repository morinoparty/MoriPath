import { Link } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";
import { sva } from "../../../../../../styled-system/css";
import type { DiaryStripDay } from "../../-types/diary-day";

const diaryDayStripStyle = sva({
    slots: ["root", "list", "day", "weekday", "number", "dot"],
    base: {
        // 帯だけは画面の端まで流し、左右の余白はスクロールの内側に持たせる
        root: {
            // 選んだ日の offsetLeft をこの要素から測るため、位置の基準にする
            position: "relative",
            marginX: "-6",
            overflowX: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
        },
        list: {
            display: "flex",
            gap: "2",
            width: "max-content",
            paddingX: "6",
        },
        day: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5",
            width: "11",
            paddingY: "2",
            borderRadius: "full",
            bg: "colorPalette.surface.subtle",
            color: "colorPalette.fg",
            transition: "background 0.15s",
            _hover: {
                bg: "colorPalette.surface.hover",
            },
            _focusVisible: {
                outline: "2px solid",
                outlineColor: "colorPalette.focusRing",
                outlineOffset: "2px",
            },
            // いま開いている日
            "&[aria-current=page]": {
                bg: "colorPalette.solid",
                color: "colorPalette.contrast",
            },
            // 日記の無い日は薄くして押せなくする
            "&[aria-disabled=true]": {
                bg: "transparent",
                opacity: "0.4",
                cursor: "default",
            },
        },
        weekday: {
            textStyle: "xs",
            opacity: "0.7",
        },
        number: {
            textStyle: "md",
            fontWeight: "bold",
            lineHeight: "1.2",
        },
        // 今日の印。今日でない日にも同じ高さを取って並びをそろえる
        dot: {
            width: "1",
            height: "1",
            borderRadius: "full",
            "&[data-today]": {
                bg: "currentColor",
            },
        },
    },
});

export interface DiaryDayStripProps {
    /** 古い順に並べた日 */
    days: DiaryStripDay[];
    /** いま開いている日 (YYYY-MM-DD) */
    selected: string;
}

/** 最近の日を横に並べ、押すとその日の日記に移る帯 */
export const DiaryDayStrip = ({ days, selected }: DiaryDayStripProps) => {
    const style = diaryDayStripStyle();
    const scrollerRef = useRef<HTMLDivElement>(null);
    const selectedRef = useRef<HTMLAnchorElement>(null);

    // 開いている日を帯の中ほどに出す。scrollIntoView はページごと縦に動くことがあるので横だけ動かす
    useLayoutEffect(() => {
        const scroller = scrollerRef.current;
        const item = selectedRef.current;
        if (!scroller || !item) {
            return;
        }
        scroller.scrollLeft =
            item.offsetLeft - (scroller.clientWidth - item.offsetWidth) / 2;
    }, [selected]);

    return (
        <div ref={scrollerRef} className={style.root}>
            <ol className={style.list} aria-label="日付をえらぶ">
                {days.map((day) => {
                    const isSelected = day.date === selected;
                    const content = (
                        <>
                            <span className={style.weekday}>{day.weekday}</span>
                            <span className={style.number}>
                                {day.dayOfMonth}
                            </span>
                            <span
                                className={style.dot}
                                data-today={day.isToday ? "" : undefined}
                                aria-hidden
                            />
                        </>
                    );
                    // 開いている日は、日記が無くても選んでいることが分かるよう押せる形で出す
                    const isDisabled = day.hasDiary === false && !isSelected;
                    // 読み上げでは「11月25日 今日」のように読む
                    const label = `${Number(day.date.slice(5, 7))}月${day.dayOfMonth}日${day.isToday ? " 今日" : ""}`;
                    return (
                        <li key={day.date}>
                            {isDisabled ? (
                                <span
                                    className={style.day}
                                    aria-disabled="true"
                                    aria-label={`${label} 日記なし`}
                                >
                                    {content}
                                </span>
                            ) : (
                                <Link
                                    ref={isSelected ? selectedRef : undefined}
                                    to="/diary/$date"
                                    params={{ date: day.date }}
                                    className={style.day}
                                    aria-current={
                                        isSelected ? "page" : undefined
                                    }
                                    aria-label={label}
                                >
                                    {content}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};
