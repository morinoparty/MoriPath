import {
    PlayerAvatarGroup,
    Timeline,
} from "@morinoparty/chlorophyll-react/components";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { PropsWithChildren } from "react";
import { sva } from "../../../../../styled-system/css";
import { formatDiaryTime } from "../../-functions/format-diary-time";
import type { DiaryEntry } from "../../-types/diary";

// TODO(#38): ダイアリーの一覧ページができたら型付きのルートに差し替える (今は catch-all に落ちる)
const DIARY_LIST_PATH = "/diary" as string;

const diarySectionStyle = sva({
    slots: [
        "root",
        "header",
        "title",
        "moreLink",
        "moreIcon",
        "time",
        "description",
        "avatars",
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
        // 本文も読み物として fg で出す
        description: {
            textStyle: "md",
            color: "colorPalette.fg",
        },
        avatars: {
            // 重なった顔の間のリングをページの地色にして、切り抜いたように見せる
            "--player-avatar-group-ring-color": "{colors.colorPalette.bg}",
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
                        {/* 居合わせたプレイヤーがいるときだけ右端に顔を並べる */}
                        {entry.players.length > 0 && (
                            <Timeline.Meta>
                                <PlayerAvatarGroup
                                    players={entry.players}
                                    max={3}
                                    size="sm"
                                    aria-label="居合わせたプレイヤー"
                                    className={style.avatars}
                                />
                            </Timeline.Meta>
                        )}
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
};
