import { Button } from "@morinoparty/chlorophyll-react/components";
import { Check } from "lucide-react";
import { css } from "../../../../../../../styled-system/css";
import { slotLabel } from "../../-functions/transit-search";
import type { TransitSlot, TransitStation } from "../../-types/transit";

// 画面の下端に置くボタン。スクロールする一覧の外 (下) に置くので、一覧とは重ならない。
// ぼかしは敷かず、地の色の帯の上にボタンを載せる
const barStyle = css({
    position: "relative",
    zIndex: 2,
    paddingTop: "2",
    paddingBottom: "max(16px, calc(env(safe-area-inset-bottom) + 8px))",
    bg: "colorPalette.bg",
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

/** 選びかけの駅を枠に入れる、画面の下端のボタン */
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
