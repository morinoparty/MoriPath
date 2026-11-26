import { Stat } from "@morinoparty/chlorophyll-react/components";
import { css, cx } from "../../../../../../styled-system/css";
import { InlineSkeleton } from "../../../../../components/skeleton";
import type { MyPageStats as MyPageStatsData } from "../../-types/my-page";

interface StatItem {
    key: string;
    label: string;
    value: number;
    unit?: string;
}

/** 取得できた値だけを表示順に並べる */
const toStatItems = (stats: MyPageStatsData): StatItem[] => {
    const items: (StatItem | null)[] = [
        stats.balance !== null
            ? { key: "balance", label: "どんぐり", value: stats.balance }
            : null,
        stats.claimBlocks !== null
            ? {
                  key: "claimBlocks",
                  label: "保護ブロック",
                  value: stats.claimBlocks,
              }
            : null,
        stats.voteStreak !== null
            ? {
                  key: "voteStreak",
                  label: "連続投票",
                  value: stats.voteStreak,
                  unit: "日",
              }
            : null,
    ];
    return items.filter((item): item is StatItem => item !== null);
};

// 隠しているあいだ数値の代わりに出す。桁数から金額を推し量れないよう、長さは固定する
const HIDDEN_MASK = "••••";

const cardStyle = css({
    // 枠線と影を持たない面のカード
    bg: "colorPalette.surface.subtle",
    borderRadius: "panel",
    paddingX: "2",
    paddingY: "3",
});

const toggleCardStyle = css({
    // カード全体に重ねる切り替えボタンの基準にする
    position: "relative",
});

const toggleButtonStyle = css({
    // <dl> を <button> で包むと不正な入れ子になるため、ボタンはカードの上に重ねて置く
    position: "absolute",
    inset: "0",
    borderRadius: "inherit",
    cursor: "pointer",
    _focusVisible: {
        outline: "2px solid",
        outlineColor: "colorPalette.focusRing",
        outlineOffset: "2px",
    },
});

const valueStackStyle = css({
    // 数値と伏せ字を 1 つのマスに重ねる。マスの幅は広い方に合わせて固定される
    display: "inline-grid",
    "& > *": { gridArea: "1 / 1" },
});

const valueTextStyle = css({
    // Stat.Value と同じく、数値と単位をベースラインで揃えて並べる
    display: "inline-flex",
    alignItems: "baseline",
    justifySelf: "center",
    columnGap: "1",
    "&[data-hidden]": { visibility: "hidden" },
});

const maskStyle = css({
    // 数値より短くても、マスの中央に置いて位置をそろえる
    justifySelf: "center",
    "&[data-hidden]": { visibility: "hidden" },
});

// <dl> では dt (ラベル) を dd (値) より前に書く必要があるため、見た目だけ値を上に出す
const statRootStyle = css({ flexDirection: "column-reverse" });

export interface MyPageStatsProps {
    stats: MyPageStatsData;
    /** 値を隠して HIDDEN_MASK を出すか (ラベルはそのまま出す) */
    hidden?: boolean;
    /** カードをタップしたときに、切り替え後の値で呼ぶ。省略するとタップで切り替えない */
    onHiddenChange?: (hidden: boolean) => void;
    className?: string;
}

/**
 * どんぐり・保護ブロック・連続投票を 1 枚のカードに並べる。値が 1 つも無ければ何も出さない。
 * onHiddenChange を渡すと、カードのタップで値の表示と非表示を切り替える
 */
export const MyPageStats = ({
    stats,
    hidden = false,
    onHiddenChange,
    className,
}: MyPageStatsProps) => {
    const items = toStatItems(stats);
    if (items.length === 0) {
        return null;
    }
    return (
        <div
            className={cx(
                cardStyle,
                onHiddenChange && toggleCardStyle,
                className,
            )}
        >
            <Stat.Group size="sm" align="center">
                {items.map((item) => (
                    <Stat.Root key={item.key} className={statRootStyle}>
                        <Stat.Label>{item.label}</Stat.Label>
                        <Stat.Value>
                            {/* 数値と伏せ字を同じマスに重ね、見えない方も幅を取らせる。切り替えても列の幅が変わらない */}
                            <span className={valueStackStyle}>
                                <span
                                    className={valueTextStyle}
                                    data-hidden={hidden || undefined}
                                    aria-hidden={hidden || undefined}
                                >
                                    {/* SSR とブラウザで桁区切りがずれないよう、ロケールを固定する */}
                                    {item.value.toLocaleString("ja-JP")}
                                    {item.unit && (
                                        <Stat.Unit>{item.unit}</Stat.Unit>
                                    )}
                                </span>
                                <span
                                    className={maskStyle}
                                    data-hidden={!hidden || undefined}
                                    aria-hidden="true"
                                >
                                    {HIDDEN_MASK}
                                </span>
                                {/* 伏せ字は読み上げず、隠していることだけを伝える */}
                                {hidden && (
                                    <span className={css({ srOnly: true })}>
                                        非表示
                                    </span>
                                )}
                            </span>
                        </Stat.Value>
                    </Stat.Root>
                ))}
            </Stat.Group>
            {onHiddenChange && (
                // 押した状態 = 隠している状態。aria-pressed と組むため、ラベルは状態で変えない
                <button
                    type="button"
                    className={toggleButtonStyle}
                    aria-label="数値を隠す"
                    aria-pressed={hidden}
                    onClick={() => onHiddenChange(!hidden)}
                />
            )}
        </div>
    );
};

// 届くまでに並べるラベル。届いたあとと同じ順にする
const SKELETON_LABELS = ["どんぐり", "保護ブロック", "連続投票"];

/** 数値が届くまでのカード。ラベルを先に出し、数字の場所にスケルトンを置く */
export const MyPageStatsSkeleton = ({ className }: { className?: string }) => (
    <div className={cx(cardStyle, className)} aria-busy="true">
        <Stat.Group size="sm" align="center">
            {SKELETON_LABELS.map((label) => (
                <Stat.Root key={label} className={statRootStyle}>
                    <Stat.Label>{label}</Stat.Label>
                    <Stat.Value>
                        <InlineSkeleton width="3em" />
                    </Stat.Value>
                </Stat.Root>
            ))}
        </Stat.Group>
    </div>
);
