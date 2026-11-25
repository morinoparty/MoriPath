import { Timeline } from "@morinoparty/chlorophyll-react/components";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { PropsWithChildren } from "react";
import { sva } from "../../../../../styled-system/css";
import { InlineSkeleton, skeletonKeys } from "../../../../components/skeleton";
import { formatDiaryTime } from "../../-functions/format-diary-time";
import type { DiaryEntry } from "../../-types/diary";
import { DiaryPlayers } from "../diary-players";

// 最新の日の日記を開くページ (/diary は最新の日付に移す)
const DIARY_LIST_PATH = "/diary";

const diarySectionStyle = sva({
    slots: [
        "root",
        "header",
        "title",
        "moreLink",
        "moreIcon",
        "time",
        "description",
        "meta",
        "empty",
    ],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "3",
        },
        header: {
            display: "flex",
            alignItems: "center",
            gap: "1.5",
            paddingTop: "2",
        },
        title: {
            flex: "1",
            textStyle: "lg",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        moreLink: {
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5",
            textStyle: "sm",
            color: "colorPalette.fg.muted",
            _hover: {
                color: "colorPalette.fg",
            },
        },
        moreIcon: {
            width: "4",
            height: "4",
        },
        // デザインでは時刻を見出しとして扱うため、レシピ既定の muted より強く出す
        time: {
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        // 本文も読み物として fg で出す。デザインでは顔の列の下まで横幅いっぱいに使う
        description: {
            gridColumn: "1 / -1",
            // 時刻の行からはみ出す顔 (上下 6px ずつ) と重ならないよう、レシピ既定より少し空ける。
            // 顔の有無で間隔が変わらないよう、全項目で同じ値にする
            mt: "2",
            textStyle: "md",
            color: "colorPalette.fg",
        },
        // 顔は時刻の行だけに置き、本文の幅を狭めない (レシピ既定は 3 行にまたがる)
        meta: {
            gridRow: "1",
            alignSelf: "center",
            // 高さを 0 にして 32px の顔で時刻の行を広げず、顔を時刻の行の中心に揃える
            height: "0",
            overflow: "visible",
        },
        empty: {
            textStyle: "sm",
            color: "colorPalette.fg.muted",
        },
    },
});

const Root = ({ children }: PropsWithChildren) => {
    const style = diarySectionStyle();
    return <section className={style.root}>{children}</section>;
};

const Header = () => {
    const style = diarySectionStyle();
    return (
        <div className={style.header}>
            <h2 className={style.title}>きょうのもりぱダイアリー</h2>
            <Link to={DIARY_LIST_PATH} className={style.moreLink}>
                すべて見る
                <ChevronRight className={style.moreIcon} aria-hidden />
            </Link>
        </div>
    );
};

interface EntriesProps {
    entries: DiaryEntry[];
}

const Entries = ({ entries }: EntriesProps) => {
    const style = diarySectionStyle();

    // 出来事がまだ無い日は一覧の代わりに一言だけ出す
    if (entries.length === 0) {
        return <p className={style.empty}>まだ記録はありません</p>;
    }

    return (
        <Timeline.Root variant="subtle">
            {entries.map((entry) => (
                <Timeline.Item key={entry.id}>
                    <Timeline.Indicator />
                    <Timeline.Connector />
                    <Timeline.Content>
                        <Timeline.Time
                            dateTime={entry.time}
                            className={style.time}
                        >
                            {formatDiaryTime(entry.time)}
                        </Timeline.Time>
                        <Timeline.Description className={style.description}>
                            {entry.description}
                        </Timeline.Description>
                        {/* 居合わせたプレイヤーがいるときだけ右端に顔を並べる。「+N」を押すと全員を見られる */}
                        {entry.players.length > 0 && (
                            <Timeline.Meta className={style.meta}>
                                <DiaryPlayers players={entry.players} />
                            </Timeline.Meta>
                        )}
                    </Timeline.Content>
                </Timeline.Item>
            ))}
        </Timeline.Root>
    );
};

interface EntriesSkeletonProps {
    /** 場所を取る件数。ホームに出す件数にそろえる */
    count: number;
}

/** 記録が届くまでのタイムライン。時刻と本文の行を、届いた記録と同じ並びで場所取りする */
const EntriesSkeleton = ({ count }: EntriesSkeletonProps) => {
    const style = diarySectionStyle();
    return (
        <Timeline.Root variant="subtle" aria-busy="true">
            {skeletonKeys(count).map((key) => (
                <Timeline.Item key={key}>
                    <Timeline.Indicator />
                    <Timeline.Connector />
                    <Timeline.Content>
                        {/* 時刻はまだ無いため、time 要素ではなく span に同じ見た目を付ける */}
                        <Timeline.Time asChild className={style.time}>
                            <span>
                                <InlineSkeleton width="3em" />
                            </span>
                        </Timeline.Time>
                        {/* 本文はたいてい 1 行に収まるため、1 行分の帯を置く */}
                        <Timeline.Description className={style.description}>
                            <InlineSkeleton width="85%" />
                        </Timeline.Description>
                    </Timeline.Content>
                </Timeline.Item>
            ))}
        </Timeline.Root>
    );
};

/** ホームの「きょうのもりぱダイアリー」。見出し + タイムライン */
export const DiarySection = {
    Root,
    Header,
    Entries,
    EntriesSkeleton,
};
