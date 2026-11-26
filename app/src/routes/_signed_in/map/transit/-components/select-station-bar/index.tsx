import { Button } from "@morinoparty/chlorophyll-react/components";
import { Check } from "lucide-react";
import { css } from "../../../../../../../styled-system/css";
import { slotLabel } from "../../-functions/transit-search";
import type { TransitSlot, TransitStation } from "../../-types/transit";

// 画面の下に貼り付くボタン。上に地の色のぼかしを敷き、流れてくる一覧と重ならないようにする
const barStyle = css({
    position: "sticky",
    bottom: "max(16px, calc(env(safe-area-inset-bottom) + 8px))",
    zIndex: 2,
    marginTop: "auto",
    "&::before": {
        content: '""',
        position: "absolute",
        insetX: "-6",
        bottom: "-24px",
        height: "104px",
        background:
            "linear-gradient(to bottom, transparent, {colors.colorPalette.bg} 35%)",
        pointerEvents: "none",
    },
});

const buttonStyle = css({
    position: "relative",
    width: "full",
    height: "48px",
    borderRadius: "full",
    fontSize: "15px",
    fontWeight: "bold",
    "& svg": { width: "18px", height: "18px" },
});

export interface SelectStationBarProps {
    /** 選びかけの駅 */
    station: TransitStation;
    /** 入れる枠 */
    slot: TransitSlot;
    onConfirm: () => void;
}

/** 選びかけの駅を枠に入れる、下に固定のボタン */
export const SelectStationBar = ({
    station,
    slot,
    onConfirm,
}: SelectStationBarProps) => (
    <div className={barStyle}>
        <Button
            intent="primary"
            size="xl"
            className={buttonStyle}
            onClick={onConfirm}
        >
            <Check strokeWidth={3} />
            {`${station.name} を${slotLabel[slot]}にする`}
        </Button>
    </div>
);
