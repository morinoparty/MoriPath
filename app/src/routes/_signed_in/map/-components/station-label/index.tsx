import { css } from "../../../../../../styled-system/css";

const stationLabelStyle = css({
    // 駅の中心に文字の中心を合わせる
    position: "absolute",
    left: 0,
    top: 0,
    transform: "translate(-50%, -50%)",
    fontSize: "12px",
    fontWeight: "bold",
    lineHeight: "1.2",
    whiteSpace: "nowrap",
    color: "colorPalette.fg",
    // 地図の模様に埋もれないよう、白いフチ取りの文字にする
    textShadow:
        "0 0 2px {colors.bg.panel}, 0 0 2px {colors.bg.panel}, 0 0 3px {colors.bg.panel}, 0 0 4px {colors.bg.panel}",
    pointerEvents: "none",
});

export interface StationLabelProps {
    name: string;
}

/** 鉄道の駅名 (駅の位置に文字だけを置く) */
export const StationLabel = ({ name }: StationLabelProps) => (
    <span className={stationLabelStyle}>{name}</span>
);
