import { sva } from "../../../../../../styled-system/css";
import { DiarySection } from "../../../-components/diary-section";
import { groupDiaryEntries } from "../../-functions/group-diary-entries";
import type { DiaryDayResult } from "../../-types/diary-day";

const diaryDayTimelineStyle = sva({
    slots: ["root", "summary", "group", "groupTitle", "empty"],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "6",
        },
        // 日が締まったあとのまとめ。地色より一段明るい面に置く
        summary: {
            padding: "5",
            borderRadius: "panel",
            bg: "colorPalette.surface.subtle",
            textStyle: "md",
            lineHeight: "1.8",
            color: "colorPalette.fg",
            whiteSpace: "pre-wrap",
        },
        group: {
            display: "flex",
            flexDirection: "column",
            gap: "3",
        },
        groupTitle: {
            textStyle: "sm",
            fontWeight: "bold",
            color: "colorPalette.fg.muted",
        },
        empty: {
            paddingY: "12",
            textAlign: "center",
            textStyle: "sm",
            color: "colorPalette.fg.muted",
        },
    },
});

export interface DiaryDayTimelineProps {
    result: DiaryDayResult;
}

/** 1 日分のダイアリー。まとめと、朝・昼・夕方・夜に分けたタイムライン */
export const DiaryDayTimeline = ({ result }: DiaryDayTimelineProps) => {
    const style = diaryDayTimelineStyle();

    if (result.kind === "empty") {
        return <p className={style.empty}>この日の日記はありません</p>;
    }
    if (result.kind === "unavailable") {
        return <p className={style.empty}>日記を読み込めませんでした</p>;
    }

    const groups = groupDiaryEntries(result.day.entries);
    return (
        <div className={style.root}>
            {result.day.summary && (
                <p className={style.summary}>{result.day.summary}</p>
            )}
            {/* 出来事がまだ無い日は、ホームと同じ一言だけを出す */}
            {groups.length === 0 ? (
                <DiarySection.Entries entries={[]} />
            ) : (
                groups.map((group) => (
                    <section
                        key={group.id}
                        className={style.group}
                        aria-label={group.label}
                    >
                        <h2 className={style.groupTitle}>{group.label}</h2>
                        <DiarySection.Entries entries={group.entries} />
                    </section>
                ))
            )}
        </div>
    );
};
