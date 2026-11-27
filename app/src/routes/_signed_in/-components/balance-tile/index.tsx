import { Stat } from "@morinoparty/chlorophyll-react/components";
import { sva } from "../../../../../styled-system/css";
import { InlineSkeleton } from "../../../../components/skeleton";

const balanceTileStyle = sva({
    slots: ["root", "label", "value"],
    base: {
        // ページの地より一段明るい面。枠線と影は付けない
        root: {
            flex: "1",
            justifyContent: "center",
            gap: "1.5",
            paddingX: "4",
            paddingY: "3",
            bg: "colorPalette.surface.subtle",
            // panel (lg) より一段丸くして、やわらかいカードにする
            borderRadius: "xl",
        },
        label: {
            textStyle: "xs",
        },
        value: {
            textStyle: "xl",
            lineHeight: "1.3",
        },
    },
});

interface BalanceTileProps {
    label: string;
    /** 表示する数値。取得できなかったときは null で「—」を出す */
    value: number | null;
    /** 数値の後ろに付ける単位 (例: 日) */
    unit?: string;
    /** 値が届くまでの場所取りを出すか。ラベルとタイルの大きさはそのままにする */
    loading?: boolean;
}

/** ホームのヒーロー右列に縦に並べる残高のタイル */
export const BalanceTile = ({
    label,
    value,
    unit,
    loading = false,
}: BalanceTileProps) => {
    const style = balanceTileStyle();

    return (
        <Stat.Root className={style.root}>
            <Stat.Label className={style.label}>{label}</Stat.Label>
            <Stat.Value className={style.value}>
                {loading ? (
                    // 数字の行と同じ高さの帯にして、届いたときにタイルが伸び縮みしないようにする
                    <InlineSkeleton width="4em" />
                ) : value === null ? (
                    // 取得できないときは単位を付けずに「—」だけ出す
                    "—"
                ) : (
                    <>
                        {/* サーバーとブラウザで区切りが変わらないようロケールを固定する */}
                        {value.toLocaleString("ja-JP")}
                        {unit && <Stat.Unit>{unit}</Stat.Unit>}
                    </>
                )}
            </Stat.Value>
        </Stat.Root>
    );
};
