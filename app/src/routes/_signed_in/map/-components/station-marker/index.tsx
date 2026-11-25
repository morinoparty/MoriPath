import type { Ref } from "react";
import { sva } from "../../../../../../styled-system/css";
import type { StationFootprint } from "../../-functions/station-hit-test";
import type { StationNumbering } from "../../-types/station";
import { NumberingBadge } from "../numbering-badge";

// 地図に並べるナンバリングの数。乗換駅でも札が並びすぎないよう、それ以上はポップアップで見せる
const MAX_BADGES = 2;

const stationMarkerStyle = sva({
    slots: ["root", "dot", "badges", "name"],
    base: {
        root: {
            // 札・点の中心を駅の中心に合わせる
            position: "absolute",
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
            p: "0",
            bg: "transparent",
            border: "none",
            borderRadius: "full",
            // 指やマウスでは押させない。駅の上からでも地図をドラッグできるよう、
            // タップは地図の click (ドラッグしなかったときだけ来る) で当たり判定して選ぶ。
            // キーボード・スクリーンリーダーからはこのボタンで選べる
            pointerEvents: "none",
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

/** 地図に出す札 (番号の無いナンバリングは出さない) */
const visibleBadges = (numberings: StationNumbering[]) =>
    numberings
        .filter((numbering) => numbering.code !== null)
        .slice(0, MAX_BADGES);

/**
 * 地図に描いた駅のおおよその大きさ (px、中心からの半分の幅と高さ)。
 * タップの当たり判定で、札に触れたか・路線とどちらが近いかを決めるのに使う。
 * 下のスタイルの寸法 (点 10px、札 24px 角 + 文字の幅、駅名 12px) に合わせた概算
 */
export const stationFootprint = (
    numberings: StationNumbering[],
    detail: StationMarkerDetail,
): StationFootprint => {
    const badgeCount = visibleBadges(numberings).length;
    if (detail === "dot" || badgeCount === 0) {
        return { halfWidth: 5, halfHeight: 5 };
    }
    // 札 1 枚は記号 3 文字までで幅 26px ほど、札どうしの間は 2px
    const halfWidth = (badgeCount * 26 + (badgeCount - 1) * 2) / 2;
    // 駅名を出すときは札の下に 2px 空けて 1 行 (約 14px) 足す
    return { halfWidth, halfHeight: detail === "full" ? 20 : 12 };
};

export interface StationMarkerProps {
    name: string;
    numberings: StationNumbering[];
    detail: StationMarkerDetail;
    onSelect?: () => void;
    ref?: Ref<HTMLButtonElement>;
}

/** 地図上の駅。見た目とキーボード操作だけを受け持ち、タップの当たり判定は地図側で行う */
export const StationMarker = ({
    name,
    numberings,
    detail,
    onSelect,
    ref,
}: StationMarkerProps) => {
    const style = stationMarkerStyle();
    const badges = visibleBadges(numberings);
    // 札が無い駅や縮小しているときは点で示す
    const showBadges = detail !== "dot" && badges.length > 0;
    return (
        <button
            ref={ref}
            type="button"
            className={style.root}
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
