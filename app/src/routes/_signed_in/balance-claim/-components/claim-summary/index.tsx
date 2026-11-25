import { Stat } from "@morinoparty/chlorophyll-react/components";
import { sva } from "../../../../../../styled-system/css";
import { formatNumber } from "../../-functions/block-count";

const claimSummaryStyle = sva({
    slots: ["root", "stat", "value"],
    base: {
        // 枠線と影を持たない面のカード
        root: {
            width: "full",
            padding: "4",
            bg: "colorPalette.surface.subtle",
            borderRadius: "panel",
        },
        // <dl> では dt (ラベル) を dd (値) より前に書く必要があるため、見た目だけ値を上に出す
        stat: {
            flexDirection: "column-reverse",
        },
        value: {
            fontSize: "20px",
            lineHeight: "1.5",
        },
    },
});

export interface ClaimSummaryProps {
    /** 保護ブロックの数。取れなかったときは null */
    remainingClaimBlocks: number | null;
    /** どんぐりの残高。取れなかったときは null */
    balance: number | null;
}

/** 保護ブロックとどんぐりを横に並べるカード。値が無いときは「—」を出す */
export const ClaimSummary = ({
    remainingClaimBlocks,
    balance,
}: ClaimSummaryProps) => {
    const style = claimSummaryStyle();
    const items = [
        { key: "blocks", label: "保護ブロック", value: remainingClaimBlocks },
        { key: "balance", label: "どんぐり", value: balance },
    ];
    return (
        <div className={style.root}>
            <Stat.Group size="sm" align="center">
                {items.map((item) => (
                    <Stat.Root key={item.key} className={style.stat}>
                        <Stat.Label>{item.label}</Stat.Label>
                        <Stat.Value className={style.value}>
                            {item.value === null
                                ? "—"
                                : formatNumber(item.value)}
                        </Stat.Value>
                    </Stat.Root>
                ))}
            </Stat.Group>
        </div>
    );
};
