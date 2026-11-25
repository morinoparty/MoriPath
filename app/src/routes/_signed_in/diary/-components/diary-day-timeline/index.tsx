import { Timeline } from "@morinoparty/chlorophyll-react/components";
import { sva } from "../../../../../../styled-system/css";
import {
    InlineSkeleton,
    Skeleton,
    skeletonKeys,
} from "../../../../../components/skeleton";
import { DiarySection } from "../../../-components/diary-section";
import { groupDiaryEntries } from "../../-functions/group-diary-entries";
import type { DiaryDayResult } from "../../-types/diary-day";

const diaryDayTimelineStyle = sva({
    slots: [
        "root",
        "summary",
        "summarySkeleton",
        "group",
        "groupTitle",
        "entryTime",
        "entryDescription",
        "empty",
    ],
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
        // まとめの面と同じ大きさ (3〜4 行ぶん) で場所を取る
        summarySkeleton: {
            height: "28",
            borderRadius: "panel",
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
        // ホームのタイムラインと同じ間隔で、時刻と本文の行を並べる
        entryTime: {
            fontWeight: "bold",
        },
        entryDescription: {
            gridColumn: "1 / -1",
            mt: "2",
            textStyle: "md",
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

// 読み込み中に並べる時間帯ごとの件数 (よくある 1 日の長さに寄せる)
const SKELETON_GROUPS = [
    { key: "first", size: 2 },
    { key: "second", size: 3 },
];

/** 1 日分のダイアリーが届くまでの場所取り。まとめの面と、時間帯ごとのタイムラインを並べる */
export const DiaryDayTimelineSkeleton = () => {
    const style = diaryDayTimelineStyle();
    return (
        <div className={style.root} aria-busy="true">
            <Skeleton variant="rect" className={style.summarySkeleton} />
            {SKELETON_GROUPS.map(({ key: groupKey, size }) => (
                <div key={groupKey} className={style.group}>
                    <p className={style.groupTitle}>
                        <InlineSkeleton width="2em" />
                    </p>
                    <Timeline.Root variant="subtle">
                        {skeletonKeys(size).map((key) => (
                            <Timeline.Item key={key}>
                                <Timeline.Indicator />
                                <Timeline.Connector />
                                <Timeline.Content>
                                    {/* 時刻はまだ無いため、time 要素ではなく span に同じ見た目を付ける */}
                                    <Timeline.Time
                                        asChild
                                        className={style.entryTime}
                                    >
                                        <span>
                                            <InlineSkeleton width="3em" />
                                        </span>
                                    </Timeline.Time>
                                    <Timeline.Description
                                        className={style.entryDescription}
                                    >
                                        <InlineSkeleton width="85%" />
                                    </Timeline.Description>
                                </Timeline.Content>
                            </Timeline.Item>
                        ))}
                    </Timeline.Root>
                </div>
            ))}
        </div>
    );
};
