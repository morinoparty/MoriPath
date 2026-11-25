import type { Ref } from "react";
import { sva } from "../../../../../../styled-system/css";
import type { StationNumbering } from "../../-types/station";
import { NumberingBadge } from "../numbering-badge";

// 指で押しやすいよう、当たり判定は最低でもこの大きさ (px) にする
export const MIN_STATION_HIT_SIZE = 44;
// 地図に並べるナンバリングの数。乗換駅でも札が並びすぎないよう、それ以上はポップアップで見せる
const MAX_BADGES = 2;

const stationMarkerStyle = sva({
    slots: ["root", "dot", "badges", "name"],
    base: {
        root: {
            // 駅の中心に当たり判定の中心を合わせる。大きさは地図の縮尺に合わせて外から渡す
            position: "absolute",
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
            width: "var(--hit-size)",
            height: "var(--hit-size)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
            p: "0",
            bg: "transparent",
            border: "none",
            borderRadius: "full",
            cursor: "pointer",
            // Leaflet はマーカーのアイコンの pointer-events を切るので、ボタンだけ押せるようにする
            pointerEvents: "auto",
            _focusVisible: {
                outline: "2px solid",
                outlineColor: "colorPalette.solid",
                outlineOffset: "2px",
            },
        },
        dot: {
            width: "10px",
            height: "10px",
            borderRadius: "full",
            bg: "bg.panel",
            borderWidth: "2px",
            borderStyle: "solid",
            borderColor: "colorPalette.solid",
        },
        badges: {
            display: "flex",
            gap: "2px",
            boxShadow: "chrome",
            borderRadius: "6px",
        },
        name: {
            fontSize: "12px",
            fontWeight: "bold",
            lineHeight: "1.2",
            whiteSpace: "nowrap",
            color: "colorPalette.fg",
            // 地図の模様に埋もれないよう、白いフチ取りの文字にする
            textShadow:
                "0 0 2px {colors.bg.panel}, 0 0 2px {colors.bg.panel}, 0 0 3px {colors.bg.panel}, 0 0 4px {colors.bg.panel}",
        },
    },
});

/** 縮尺に応じた見せ方。縮小しているときは点だけ、拡大するほど札と駅名を出す */
export type StationMarkerDetail = "dot" | "badges" | "full";

export interface StationMarkerProps {
    name: string;
    numberings: StationNumbering[];
    detail: StationMarkerDetail;
    /** 当たり判定の一辺 (px)。MIN_STATION_HIT_SIZE より小さくはしない */
    hitSize?: number;
    onSelect?: () => void;
    ref?: Ref<HTMLButtonElement>;
}

/** 地図上の駅。駅の周りを押すと駅を選ぶ (路線より優先する) */
export const StationMarker = ({
    name,
    numberings,
    detail,
    hitSize = MIN_STATION_HIT_SIZE,
    onSelect,
    ref,
}: StationMarkerProps) => {
    const style = stationMarkerStyle();
    const badges = numberings
        .filter((numbering) => numbering.code !== null)
        .slice(0, MAX_BADGES);
    // 札が無い駅や縮小しているときは点で示す
    const showBadges = detail !== "dot" && badges.length > 0;
    return (
        <button
            ref={ref}
            type="button"
            className={style.root}
            style={
                {
                    "--hit-size": `${Math.max(hitSize, MIN_STATION_HIT_SIZE)}px`,
                } as React.CSSProperties
            }
            aria-label={name}
            onClick={onSelect}
        >
            {showBadges ? (
                <span className={style.badges}>
                    {badges.map((numbering) => (
                        <NumberingBadge
                            key={numbering.code}
                            code={numbering.code ?? ""}
                            color={numbering.color}
                            size="sm"
                        />
                    ))}
                </span>
            ) : (
                <span className={style.dot} aria-hidden />
            )}
            {detail === "full" && (
                <span className={style.name} aria-hidden>
                    {name}
                </span>
            )}
        </button>
    );
};
