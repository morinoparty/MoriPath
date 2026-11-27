import { IconButton } from "@morinoparty/chlorophyll-react/components";
import {
    LandPlot,
    type LucideIcon,
    MapPin,
    Store,
    TrainFront,
    XIcon,
} from "lucide-react";
import { sva } from "../../../../../../styled-system/css";
import type { MapPinType } from "../../-types/map-pin-target";

const mapTargetPinStyle = sva({
    slots: [
        "root",
        "card",
        "body",
        "kind",
        "kindIcon",
        "label",
        "coords",
        "close",
        "head",
        "headIcon",
        "ground",
    ],
    base: {
        root: {
            // 座標の位置に足元の影の中心が来るよう、左右中央・下端を基準に置く
            position: "absolute",
            left: 0,
            bottom: 0,
            transform: "translate(-50%, 3px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            // ピンの上から地図をドラッグできるよう、カード以外は触らせない
            pointerEvents: "none",
        },
        card: {
            // ほかのポップアップと同じ白い面 + 影のカード
            display: "flex",
            alignItems: "center",
            gap: "1",
            width: "max-content",
            maxWidth: "min(260px, calc(100vw - 64px))",
            mb: "2",
            py: "2",
            ps: "3.5",
            pe: "1",
            bg: "bg.panel",
            color: "fg",
            borderRadius: "panel",
            boxShadow: "chrome",
            textStyle: "body",
            pointerEvents: "auto",
            cursor: "default",
        },
        body: {
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
        },
        kind: {
            display: "flex",
            alignItems: "center",
            gap: "1",
            fontSize: "xs",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        kindIcon: {
            width: "14px",
            height: "14px",
        },
        label: {
            fontSize: "md",
            fontWeight: "bold",
            lineHeight: "1.4",
            // 長い名前は 1 行で切り、カードを縦に伸ばさない
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
        },
        coords: {
            fontSize: "xs",
            color: "fg.muted",
            fontVariantNumeric: "tabular-nums",
        },
        close: {
            flexShrink: 0,
            color: "fg.muted",
        },
        head: {
            // 先が下を向いた雫形 (角を 1 つだけ尖らせた正方形を 45 度回す)
            display: "grid",
            placeItems: "center",
            width: "40px",
            height: "40px",
            borderRadius: "full",
            borderBottomRightRadius: "0",
            transform: "rotate(45deg)",
            bg: "colorPalette.solid",
            color: "colorPalette.contrast",
            borderWidth: "3px",
            borderStyle: "solid",
            borderColor: "bg.panel",
            boxShadow: "chrome",
        },
        headIcon: {
            width: "20px",
            height: "20px",
            // 回した雫の中でアイコンはまっすぐに戻す
            transform: "rotate(-45deg)",
        },
        ground: {
            // 指している地点の足元に落ちる影。ピンの先がどこを刺しているかを見せる
            width: "14px",
            height: "6px",
            mt: "1",
            borderRadius: "full",
            bg: "colorPalette.solid",
            opacity: 0.45,
        },
    },
});

// 種類ごとのアイコンと呼び名
const pinKinds: Record<MapPinType, { icon: LucideIcon; name: string }> = {
    shop: { icon: Store, name: "お店" },
    claim: { icon: LandPlot, name: "土地" },
    station: { icon: TrainFront, name: "駅" },
    point: { icon: MapPin, name: "地点" },
};

export interface MapTargetPinProps {
    type: MapPinType;
    x: number;
    z: number;
    /** 地点の名前 (お店のアイテム名など)。無ければ種類だけ出す */
    label?: string;
    /** ピンを外す。渡さなければ閉じるボタンを出さない */
    onClear?: () => void;
}

/** 他の画面から渡された地点を指す、目立つピンと名前のカード */
export const MapTargetPin = ({
    type,
    x,
    z,
    label,
    onClear,
}: MapTargetPinProps) => {
    const style = mapTargetPinStyle();
    const { icon: Icon, name } = pinKinds[type];
    return (
        <div className={style.root}>
            <div className={style.card}>
                <div className={style.body}>
                    <span className={style.kind}>
                        <Icon className={style.kindIcon} aria-hidden />
                        {name}
                    </span>
                    {/* 名前は URL から来るので、HTML ではなく文字として出す */}
                    {label && <span className={style.label}>{label}</span>}
                    <span className={style.coords}>
                        X {x} / Z {z}
                    </span>
                </div>
                {onClear && (
                    <IconButton
                        variant="ghost"
                        shape="circle"
                        size="sm"
                        aria-label="ピンを外す"
                        className={style.close}
                        onClick={onClear}
                    >
                        <XIcon />
                    </IconButton>
                )}
            </div>
            <span className={style.head} aria-hidden>
                <Icon className={style.headIcon} />
            </span>
            <span className={style.ground} aria-hidden />
        </div>
    );
};
