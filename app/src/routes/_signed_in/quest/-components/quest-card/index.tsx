import { Progress } from "@ark-ui/react/progress";
import { Badge } from "@morinoparty/chlorophyll-react/components";
import { Check, Gift } from "lucide-react";
import { css, cx, sva } from "../../../../../../styled-system/css";
import { DIFFICULTY_PALETTE_CLASS } from "../../-functions/difficulty-palette";
import {
    DIFFICULTY_LABELS,
    RARITY_LABELS,
} from "../../-functions/quest-difficulty";
import type { DailyQuest } from "../../-types/quest";

const questCardStyle = sva({
    slots: [
        "root",
        "badges",
        "title",
        "objective",
        "progress",
        "track",
        "range",
        "footer",
        "amount",
        "status",
        "statusIcon",
    ],
    base: {
        // ページの地より一段明るい面。枠線と影は付けない
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "2",
            padding: "4",
            bg: "colorPalette.surface.subtle",
            borderRadius: "panel",
        },
        badges: {
            display: "flex",
            gap: "1.5",
        },
        title: {
            textStyle: "lg",
            fontWeight: "bold",
            lineHeight: "1.4",
            color: "colorPalette.fg",
        },
        objective: {
            textStyle: "sm",
            color: "colorPalette.fg.muted",
            // 説明文の改行はそのまま見せる
            whiteSpace: "pre-line",
        },
        progress: {
            display: "flex",
            flexDirection: "column",
            gap: "1.5",
            marginTop: "1",
        },
        track: {
            height: "8px",
            borderRadius: "full",
            overflow: "hidden",
            bg: "colorPalette.surface.hover",
        },
        // 進んだぶんは難易度の色で塗る
        range: {
            height: "full",
            borderRadius: "full",
            bg: "colorPalette.solid",
            transition: "width 0.3s",
            _motionReduce: { transition: "none" },
        },
        footer: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "2",
        },
        amount: {
            textStyle: "sm",
            fontWeight: "bold",
            fontVariantNumeric: "tabular-nums",
            color: "colorPalette.fg",
        },
        status: {
            display: "inline-flex",
            alignItems: "center",
            gap: "1",
            textStyle: "sm",
            fontWeight: "bold",
            color: "colorPalette.fg.muted",
            "&[data-status=reportable]": {
                color: "colorPalette.fg",
            },
        },
        statusIcon: {
            width: "4",
            height: "4",
        },
    },
});

/** 進み具合の一言。達成後はゲーム内の受付嬢へ報告して報酬を受け取る */
const STATUS_LABELS: Record<DailyQuest["status"], string | null> = {
    active: null,
    reportable: "受付嬢に報告しよう",
    completed: "報酬を受け取りました",
};

export interface QuestCardProps {
    quest: DailyQuest;
}

/** 受けているデイリークエスト 1 件。難易度・目標・進み具合を出す */
export const QuestCard = ({ quest }: QuestCardProps) => {
    const style = questCardStyle();
    const rarityLabel = quest.rarity ? RARITY_LABELS[quest.rarity] : undefined;
    const statusLabel = STATUS_LABELS[quest.status];
    const StatusIcon = quest.status === "completed" ? Check : Gift;

    return (
        <article
            className={cx(
                style.root,
                DIFFICULTY_PALETTE_CLASS[quest.difficulty],
            )}
        >
            <div className={style.badges}>
                <Badge variant="subtle" size="sm">
                    {DIFFICULTY_LABELS[quest.difficulty]}
                </Badge>
                {/* common は出さず、当たりのときだけ目立たせる */}
                {rarityLabel && (
                    <Badge variant="solid" size="sm">
                        {rarityLabel}
                    </Badge>
                )}
            </div>
            <h3 className={style.title}>{quest.title}</h3>
            {quest.objective && (
                <p className={style.objective}>{quest.objective}</p>
            )}
            <Progress.Root
                className={style.progress}
                value={quest.progressPercentage}
                min={0}
                max={100}
            >
                <Progress.Label className={css({ srOnly: true })}>
                    {quest.title}の進み具合
                </Progress.Label>
                <Progress.Track className={style.track}>
                    <Progress.Range className={style.range} />
                </Progress.Track>
                <div className={style.footer}>
                    <span className={style.amount}>
                        {quest.currentAmount !== null &&
                        quest.totalAmount !== null
                            ? `${quest.currentAmount} / ${quest.totalAmount}`
                            : `${quest.progressPercentage}%`}
                    </span>
                    {statusLabel && (
                        <span
                            className={style.status}
                            data-status={quest.status}
                        >
                            <StatusIcon
                                className={style.statusIcon}
                                aria-hidden
                            />
                            {statusLabel}
                        </span>
                    )}
                </div>
            </Progress.Root>
        </article>
    );
};
