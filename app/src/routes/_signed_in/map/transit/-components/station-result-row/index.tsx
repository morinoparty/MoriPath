import { Check } from "lucide-react";
import { sva } from "../../../../../../../styled-system/css";
import { NumberingBadge } from "../../../-components/numbering-badge";
import { townOf } from "../../-functions/nearby-stations";
import type {
    SlotLabel,
    TransitLine,
    TransitStation,
} from "../../-types/transit";
import { lineColorStyle } from "../line-row";
import { TownThumb } from "../town-thumbs";

const stationResultRowStyle = sva({
    slots: [
        "root",
        "badges",
        "text",
        "nameRow",
        "name",
        "mark",
        "nearest",
        "spacer",
        "town",
        "lines",
        "line",
        "lineDot",
        "distance",
        "distanceValue",
        "distanceUnit",
        "check",
        "tag",
    ],
    base: {
        // 検索結果と近くの駅で使う 1 駅のカード
        root: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "full",
            paddingX: "14px",
            paddingY: "12px",
            borderRadius: "20px",
            bg: "colorPalette.surface.subtle",
            textAlign: "left",
            color: "fg",
            cursor: "pointer",
            transitionProperty: "background",
            transitionDuration: "fast",
            _hover: { bg: "colorPalette.surface.hover" },
            _focusVisible: {
                outline: "2px solid {colors.colorPalette.solid}",
                outlineOffset: "2px",
            },
            "&[aria-pressed=true]": { bg: "colorPalette.surface" },
            _disabled: {
                cursor: "default",
                _hover: { bg: "colorPalette.surface.subtle" },
            },
        },
        // 番号の札を縦に積む列。幅をそろえて駅名の左端を合わせる
        badges: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "4px",
            flexShrink: 0,
            width: "52px",
            "[disabled] > &": { opacity: "0.45" },
        },
        text: {
            flex: "1",
            minWidth: "0",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            "[disabled] > &": { opacity: "0.45" },
        },
        nameRow: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: "0",
        },
        name: {
            minWidth: "0",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "15px",
            fontWeight: "bold",
            lineHeight: "1.3",
            color: "fg",
        },
        // 検索語に当たった文字
        mark: {
            bg: "transparent",
            color: "colorPalette.solid",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
        },
        nearest: {
            flexShrink: 0,
            px: "8px",
            py: "1px",
            borderRadius: "full",
            bg: "colorPalette.surface",
            fontSize: "10px",
            fontWeight: "bold",
            color: "colorPalette.fg",
            whiteSpace: "nowrap",
        },
        spacer: { flex: "1" },
        town: {
            flexShrink: 0,
            fontSize: "11px",
            fontWeight: "medium",
            color: "fg.muted",
            whiteSpace: "nowrap",
        },
        lines: {
            display: "flex",
            flexWrap: "wrap",
            gap: "2px 8px",
        },
        line: {
            display: "flex",
            alignItems: "center",
            gap: "4px",
            minWidth: "0",
            fontSize: "12px",
            fontWeight: "medium",
            color: "fg.muted",
        },
        // 路線の色はデータ由来なので CSS 変数で受け取る
        lineDot: {
            flexShrink: 0,
            width: "8px",
            height: "8px",
            borderRadius: "full",
            bg: "var(--line-color, {colors.colorPalette.solid})",
        },
        distance: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            flexShrink: 0,
        },
        distanceValue: {
            textStyle: "display",
            fontSize: "18px",
            fontWeight: "semibold",
            lineHeight: "1.1",
            color: "colorPalette.fg",
            fontVariantNumeric: "tabular-nums",
        },
        distanceUnit: {
            fontSize: "10px",
            fontWeight: "medium",
            color: "fg.muted",
        },
        check: {
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            width: "24px",
            height: "24px",
            borderRadius: "full",
            bg: "colorPalette.solid",
            color: "colorPalette.contrast",
            "& svg": { width: "14px", height: "14px" },
        },
        tag: {
            flexShrink: 0,
            px: "8px",
            py: "2px",
            borderRadius: "full",
            bg: "bg.muted",
            color: "fg.muted",
            fontSize: "11px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
        },
    },
});

/** 札は 3 つまで (それ以上は行が縦に伸びすぎる) */
const MAX_BADGES = 3;

export interface StationResultRowProps {
    station: TransitStation;
    /** 路線名を引くための索引 */
    lines: ReadonlyMap<string, TransitLine>;
    /** station.fullName の中で検索語に当たった範囲 */
    nameRange?: [number, number] | null;
    /** 現在地からの距離 (ブロック) */
    distance?: number;
    /** いちばん近い駅 */
    isNearest?: boolean;
    selected: boolean;
    /** もう一方の枠に入っている駅なら、その枠の名前 (選べない) */
    disabledLabel?: SlotLabel;
    onClick: () => void;
}

/** 名前の当たった部分を強調して書く */
const HighlightedName = ({
    text,
    range,
    markClassName,
}: {
    text: string;
    range: [number, number] | null | undefined;
    markClassName: string;
}) => {
    if (!range) return text;
    const [start, end] = range;
    return (
        <>
            {text.slice(0, start)}
            <mark className={markClassName}>{text.slice(start, end)}</mark>
            {text.slice(end)}
        </>
    );
};

/** 検索結果・近くの駅の 1 行。番号・駅名・通る路線と、街の駅なら写真を並べる */
export const StationResultRow = ({
    station,
    lines,
    nameRange,
    distance,
    isNearest = false,
    selected,
    disabledLabel,
    onClick,
}: StationResultRowProps) => {
    const style = stationResultRowStyle();
    const town = townOf(station);
    const codes = station.numberings
        .filter((n) => n.code !== null)
        .slice(0, MAX_BADGES);
    return (
        <button
            type="button"
            className={style.root}
            aria-pressed={selected}
            disabled={disabledLabel !== undefined}
            onClick={onClick}
        >
            {codes.length > 0 && (
                <span className={style.badges}>
                    {codes.map((n) => (
                        <NumberingBadge
                            key={n.lineId}
                            code={n.code ?? ""}
                            color={n.color}
                            layout="inline"
                            size="sm"
                        />
                    ))}
                </span>
            )}
            <span className={style.text}>
                <span className={style.nameRow}>
                    <span className={style.name}>
                        <HighlightedName
                            text={station.fullName}
                            range={nameRange}
                            markClassName={style.mark}
                        />
                    </span>
                    {isNearest && (
                        <span className={style.nearest}>いちばん近い</span>
                    )}
                    <span className={style.spacer} />
                    {/* 街の駅だけ街の名前を添える (街の駅でなければ何も書かない) */}
                    {town && <span className={style.town}>{town.label}</span>}
                </span>
                <span className={style.lines}>
                    {station.numberings.map((n) => {
                        const line = lines.get(n.lineId);
                        if (!line) return null;
                        return (
                            <span
                                key={n.lineId}
                                className={style.line}
                                style={lineColorStyle(n.color)}
                            >
                                <span className={style.lineDot} aria-hidden />
                                {line.name}
                            </span>
                        );
                    })}
                </span>
            </span>
            {town && <TownThumb town={town} size={32} />}
            {distance !== undefined && (
                <span className={style.distance}>
                    <span className={style.distanceValue}>
                        {distance.toLocaleString("ja-JP")}
                    </span>
                    <span className={style.distanceUnit}>ブロック</span>
                </span>
            )}
            {disabledLabel ? (
                <span className={style.tag}>{disabledLabel}</span>
            ) : (
                selected && (
                    <span className={style.check} aria-hidden>
                        <Check strokeWidth={3} />
                    </span>
                )
            )}
        </button>
    );
};
