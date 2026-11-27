import { SegmentGroup } from "@morinoparty/chlorophyll-react/components";
import { Search, TrainFront } from "lucide-react";
import { sva } from "../../../../../../../styled-system/css";
import type { TransitMode } from "../../-types/transit";

// Chlorophyll の SegmentGroup はフォーム向けの白い面と枠線なので、カードと同じ柔らかい面のピルに上書きする
const modeTabsStyle = sva({
    slots: ["root", "control", "indicator", "item"],
    base: {
        root: {
            display: "flex",
            width: "full",
        },
        control: {
            width: "full",
            height: "auto",
            padding: "4px",
            borderWidth: "0",
            borderRadius: "full",
            bg: "colorPalette.surface.subtle",
        },
        indicator: {
            borderRadius: "full",
            bg: "colorPalette.solid",
            boxShadow: "none",
        },
        item: {
            gap: "6px",
            paddingY: "9px",
            borderRadius: "full",
            fontSize: "14px",
            fontWeight: "bold",
            color: "colorPalette.fg",
            // 上で色を上書きしたので、選択中 (solid の上) の白文字もここで指定し直す
            _checked: { color: "colorPalette.contrast" },
            "& svg": { width: "16px", height: "16px" },
        },
    },
});

const modes: { value: TransitMode; label: string; icon: typeof TrainFront }[] =
    [
        { value: "line", label: "路線からえらぶ", icon: TrainFront },
        { value: "search", label: "駅名でさがす", icon: Search },
    ];

export interface ModeTabsProps {
    value: TransitMode;
    onValueChange: (mode: TransitMode) => void;
}

/** 駅のえらび方 (路線から / 駅名で) の切り替え */
export const ModeTabs = ({ value, onValueChange }: ModeTabsProps) => {
    const style = modeTabsStyle();
    return (
        <SegmentGroup.Root
            className={style.root}
            value={value}
            aria-label="駅のえらび方"
            onValueChange={(details) => {
                // 未選択 (null) にはならないが、型の上で絞ってから渡す
                if (details.value === "line" || details.value === "search") {
                    onValueChange(details.value);
                }
            }}
        >
            <SegmentGroup.Control className={style.control}>
                <SegmentGroup.Indicator className={style.indicator} />
                {modes.map(({ value: mode, label, icon: Icon }) => (
                    <SegmentGroup.Item
                        key={mode}
                        value={mode}
                        className={style.item}
                    >
                        <Icon aria-hidden />
                        <SegmentGroup.ItemText>{label}</SegmentGroup.ItemText>
                        <SegmentGroup.ItemControl />
                        <SegmentGroup.ItemHiddenInput />
                    </SegmentGroup.Item>
                ))}
            </SegmentGroup.Control>
        </SegmentGroup.Root>
    );
};
