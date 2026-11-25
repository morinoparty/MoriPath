import { Stat } from "@morinoparty/chlorophyll-react/components";
import { css, cx } from "../../../../../../styled-system/css";
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

const cardStyle = css({
    // 枠線と影を持たない面のカード
    bg: "colorPalette.surface.subtle",
    borderRadius: "panel",
    paddingX: "2",
    paddingY: "3",
});

// <dl> では dt (ラベル) を dd (値) より前に書く必要があるため、見た目だけ値を上に出す
const statRootStyle = css({ flexDirection: "column-reverse" });

export interface MyPageStatsProps {
    stats: MyPageStatsData;
    className?: string;
}

/** どんぐり・保護ブロック・連続投票を 1 枚のカードに並べる。値が 1 つも無ければ何も出さない */
export const MyPageStats = ({ stats, className }: MyPageStatsProps) => {
    const items = toStatItems(stats);
    if (items.length === 0) {
        return null;
    }
    return (
        <div className={cx(cardStyle, className)}>
            <Stat.Group size="sm" align="center">
                {items.map((item) => (
                    <Stat.Root key={item.key} className={statRootStyle}>
                        <Stat.Label>{item.label}</Stat.Label>
                        <Stat.Value>
                            {/* SSR とブラウザで桁区切りがずれないよう、ロケールを固定する */}
                            {item.value.toLocaleString("ja-JP")}
                            {item.unit && <Stat.Unit>{item.unit}</Stat.Unit>}
                        </Stat.Value>
                    </Stat.Root>
                ))}
            </Stat.Group>
        </div>
    );
};
