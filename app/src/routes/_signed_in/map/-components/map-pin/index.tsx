import { type LucideIcon, MapPin as MapPinIcon } from "lucide-react";
import { sva } from "../../../../../../styled-system/css";

const mapPinStyle = sva({
    slots: ["root", "label", "head", "icon", "tail"],
    base: {
        root: {
            // 座標の位置にピンの先端が来るよう、左右中央・下端を基準に置く
            position: "absolute",
            left: 0,
            bottom: 0,
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1",
            pointerEvents: "none",
        },
        label: {
            fontSize: "13px",
            fontWeight: "bold",
            lineHeight: "1.2",
            whiteSpace: "nowrap",
            color: "colorPalette.fg",
            // 地図の模様に埋もれないよう、白いフチ取りの文字にする
            textShadow:
                "0 0 2px {colors.bg.panel}, 0 0 2px {colors.bg.panel}, 0 0 3px {colors.bg.panel}, 0 0 4px {colors.bg.panel}",
        },
        head: {
            display: "grid",
            placeItems: "center",
            width: "32px",
            height: "32px",
            borderRadius: "l2",
            bg: "colorPalette.solid",
            color: "colorPalette.contrast",
            borderWidth: "2px",
            borderStyle: "solid",
            borderColor: "bg.panel",
            boxShadow: "chrome",
        },
        icon: {
            width: "18px",
            height: "18px",
        },
        tail: {
            // 頭の下の小さな三角で、指している地点を示す
            width: "10px",
            height: "6px",
            marginTop: "-5px",
            bg: "colorPalette.solid",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
        },
    },
});

export interface MapPinProps {
    /** ピンの上に出す名前 (町の名前など) */
    label?: string;
    /** ピンの中のアイコン */
    icon?: LucideIcon;
}

/** 地図上の地点を示すピン。町の名前 (バナー) やスポーン地点に使う */
export const MapPin = ({ label, icon: Icon = MapPinIcon }: MapPinProps) => {
    const style = mapPinStyle();
    return (
        <div className={style.root}>
            {label && <span className={style.label}>{label}</span>}
            <span className={style.head}>
                <Icon className={style.icon} aria-hidden />
            </span>
            <span className={style.tail} aria-hidden />
        </div>
    );
};
