import { Footprints } from "lucide-react";
import { css } from "../../../../../../../styled-system/css";
import { NumberingBadge } from "../../../-components/numbering-badge";
import { formatDuration } from "../../-functions/format-duration";
import type { Town } from "../../-types/town";
import type { RouteSegment } from "../../-types/transit";
import { lineColorStyle, lineRowStyle } from "../line-row";
import { TownThumbs } from "../town-thumbs";

// 区間の所要時間 (行の右上)
const timeStyle = css({
    flexShrink: 0,
    fontSize: "13px",
    fontWeight: "bold",
    color: "colorPalette.fg",
    whiteSpace: "nowrap",
});

// 徒歩の区間は路線の色が無いので、面の色の帯に足あとのアイコンを重ねる
const walkBarStyle = css({
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    width: "28px",
    height: "40px",
    borderRadius: "10px",
    bg: "colorPalette.surface",
    color: "colorPalette.fg",
    "& svg": { width: "18px", height: "18px" },
});

const stopsStyle = css({
    flexShrink: 0,
    fontSize: "11px",
    fontWeight: "medium",
    color: "fg.muted",
    whiteSpace: "nowrap",
});

export interface RouteSegmentRowProps {
    segment: RouteSegment;
    /** 区間が通る街 (rail のときだけ使う) */
    towns: Town[];
}

/** 経路の 1 区間。路線一覧の行と同じ見た目で、乗る路線・駅・時間を並べる */
export const RouteSegmentRow = ({ segment, towns }: RouteSegmentRowProps) => {
    const style = lineRowStyle();
    if (segment.kind === "walk") {
        return (
            <div className={style.root}>
                <span className={walkBarStyle} aria-hidden>
                    <Footprints />
                </span>
                <span className={style.text}>
                    <span className={style.nameRow}>
                        <span className={style.name}>徒歩</span>
                        <span className={style.spacer} />
                        <span className={timeStyle}>
                            {formatDuration(segment.timeSeconds)}
                        </span>
                    </span>
                    <span className={style.direction}>
                        <span className={style.directionText}>
                            {`${segment.fromName} → ${segment.toName}`}
                        </span>
                    </span>
                </span>
            </div>
        );
    }
    return (
        <div className={style.root} style={lineColorStyle(segment.color)}>
            <span className={style.bar} aria-hidden />
            <span className={style.text}>
                <span className={style.nameRow}>
                    {segment.prefix && (
                        <NumberingBadge
                            code={segment.prefix}
                            color={segment.color}
                            layout="inline"
                        />
                    )}
                    <span className={style.name}>{segment.lineName}</span>
                    {segment.lineSubName && (
                        <span className={style.subName}>
                            {segment.lineSubName}
                        </span>
                    )}
                    <span className={style.spacer} />
                    <span className={timeStyle}>
                        {formatDuration(segment.timeSeconds)}
                    </span>
                </span>
                <span className={style.direction}>
                    <TownThumbs towns={towns} />
                    <span className={style.directionText}>
                        {`${segment.fromName} → ${segment.toName}`}
                    </span>
                    <span
                        className={stopsStyle}
                    >{`${segment.stopCount}駅`}</span>
                </span>
            </span>
        </div>
    );
};
