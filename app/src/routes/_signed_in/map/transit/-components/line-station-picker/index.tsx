import { IconButton } from "@morinoparty/chlorophyll-react/components";
import { Check, ChevronLeft } from "lucide-react";
import { css, sva } from "../../../../../../../styled-system/css";
import { NumberingBadge } from "../../../-components/numbering-badge";
import { townOf } from "../../-functions/nearby-stations";
import type {
    DisabledStation,
    LineStationRow,
    TransitLine,
    TransitStation,
} from "../../-types/transit";
import { lineColorStyle } from "../line-row";
import { TownThumb } from "../town-thumbs";

const linePickerStyle = sva({
    slots: [
        "root",
        "header",
        "dot",
        "name",
        "subName",
        "spacer",
        "count",
        "countNumber",
        "countUnit",
        "list",
    ],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "8px",
        },
        // 開いている路線の見出しピル
        header: {
            display: "flex",
            alignItems: "center",
            gap: "10px",
            paddingLeft: "6px",
            paddingRight: "14px",
            paddingY: "6px",
            borderRadius: "full",
            bg: "colorPalette.surface.subtle",
            color: "colorPalette.fg",
        },
        dot: {
            flexShrink: 0,
            width: "10px",
            height: "10px",
            borderRadius: "full",
            bg: "var(--line-color, {colors.colorPalette.solid})",
        },
        name: {
            minWidth: "0",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "14px",
            fontWeight: "bold",
        },
        subName: {
            flexShrink: 0,
            fontSize: "11px",
            fontWeight: "medium",
            color: "fg.muted",
            whiteSpace: "nowrap",
        },
        spacer: { flex: "1" },
        count: {
            display: "flex",
            alignItems: "baseline",
            gap: "1px",
            flexShrink: 0,
        },
        countNumber: {
            textStyle: "display",
            fontSize: "14px",
            fontWeight: "semibold",
            lineHeight: "1",
        },
        countUnit: {
            fontSize: "11px",
            fontWeight: "medium",
            color: "fg.muted",
        },
        list: {
            display: "flex",
            flexDirection: "column",
        },
    },
});

// 戻るボタンは見出しピルの中の小さな丸にする
const backStyle = css({
    flexShrink: 0,
    width: "28px",
    height: "28px",
    minWidth: "28px",
    bg: "colorPalette.surface",
    color: "colorPalette.fg",
    _hover: { bg: "colorPalette.surface.hover" },
    "& svg": { width: "16px", height: "16px" },
});

const stationRowStyle = sva({
    slots: [
        "row",
        "rail",
        "body",
        "line1",
        "name",
        "transfers",
        "town",
        "radio",
        "check",
        "tag",
    ],
    base: {
        // 路線図の 1 駅。押すとこの駅を選ぶ
        row: {
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "full",
            height: "40px",
            paddingLeft: "6px",
            paddingRight: "12px",
            borderRadius: "16px",
            textAlign: "left",
            color: "colorPalette.fg",
            cursor: "pointer",
            transitionProperty: "background",
            transitionDuration: "fast",
            _hover: { bg: "colorPalette.surface.subtle" },
            _focusVisible: {
                outline: "2px solid {colors.colorPalette.solid}",
                outlineOffset: "-2px",
            },
            "&[aria-pressed=true]": {
                height: "44px",
                borderRadius: "20px",
                bg: "colorPalette.surface.active",
            },
            _disabled: { cursor: "default", _hover: { bg: "transparent" } },
        },
        // 路線の色の線と駅の丸。線は行の高さいっぱいに引き、端の駅だけ丸で止める
        rail: {
            position: "relative",
            alignSelf: "stretch",
            flexShrink: 0,
            width: "24px",
            "&::before": {
                content: '""',
                position: "absolute",
                left: "10px",
                width: "4px",
                top: "0",
                bottom: "0",
                bg: "var(--line-color, {colors.colorPalette.solid})",
            },
            "&[data-edge=first]::before": { top: "50%" },
            "&[data-edge=last]::before": { bottom: "50%" },
            "&[data-edge=only]::before": { display: "none" },
            "&::after": {
                content: '""',
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "12px",
                height: "12px",
                transform: "translate(-50%, -50%)",
                borderRadius: "full",
                borderWidth: "3px",
                borderStyle: "solid",
                borderColor: "var(--line-color, {colors.colorPalette.solid})",
                bg: "bg.panel",
            },
            "[disabled] > &": { "&::after": { opacity: "0.45" } },
        },
        body: {
            flex: "1",
            minWidth: "0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "1px",
            overflow: "hidden",
            "[disabled] > &": { opacity: "0.45" },
        },
        line1: {
            display: "flex",
            alignItems: "center",
            gap: "6px",
            minWidth: "0",
        },
        // 駅名は省略せず全部見せる (縮めない)
        name: {
            flexShrink: 0,
            whiteSpace: "nowrap",
            fontSize: "15px",
            fontWeight: "bold",
            lineHeight: "1.3",
        },
        // 乗換の番号の札。駅名の右に並べ、入りきらない分は横にスクロールして見せる
        transfers: {
            flex: "1",
            minWidth: "0",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            overflowX: "auto",
            overscrollBehaviorX: "contain",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            "& > *": { flexShrink: 0 },
        },
        town: {
            fontSize: "11px",
            fontWeight: "medium",
            lineHeight: "1.2",
            color: "fg.muted",
            whiteSpace: "nowrap",
        },
        // 未選択の駅の丸 (ラジオの見た目)
        radio: {
            flexShrink: 0,
            width: "24px",
            height: "24px",
            borderRadius: "full",
            bg: "colorPalette.surface",
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
        // もう一方の枠で選んでいる駅のしるし
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

export interface LineStationPickerProps {
    line: TransitLine;
    rows: LineStationRow[];
    /** 選んでいる駅 (選びかけの駅、なければ枠に入っている駅) */
    selectedId: string | null;
    /** もう一方の枠に入っている駅。選べないようにする */
    disabled: DisabledStation | null;
    onBack: () => void;
    onSelect: (station: TransitStation) => void;
}

/** 路線の駅を縦の路線図で並べて選ぶ */
export const LineStationPicker = ({
    line,
    rows,
    selectedId,
    disabled,
    onBack,
    onSelect,
}: LineStationPickerProps) => {
    const style = linePickerStyle();
    const rowStyle = stationRowStyle();
    return (
        <section
            className={style.root}
            style={lineColorStyle(line.color)}
            aria-label={`${line.name}の駅`}
        >
            <div className={style.header}>
                <IconButton
                    variant="ghost"
                    shape="circle"
                    size="sm"
                    className={backStyle}
                    aria-label="路線一覧にもどる"
                    onClick={onBack}
                >
                    <ChevronLeft />
                </IconButton>
                <span className={style.dot} aria-hidden />
                <span className={style.name}>{line.name}</span>
                {line.subName && (
                    <span className={style.subName}>{line.subName}</span>
                )}
                <span className={style.spacer} />
                <span className={style.count}>
                    <span className={style.countNumber}>{rows.length}</span>
                    <span className={style.countUnit}>駅</span>
                </span>
            </div>
            <ul className={style.list}>
                {rows.map((row, i) => {
                    const { station, code, transfers } = row;
                    const selected = station.id === selectedId;
                    const isDisabled = disabled?.id === station.id;
                    const town = townOf(station);
                    // 端の駅は線を丸で止める
                    const edge =
                        rows.length === 1
                            ? "only"
                            : i === 0
                              ? "first"
                              : i === rows.length - 1
                                ? "last"
                                : undefined;
                    return (
                        <li key={station.id}>
                            <button
                                type="button"
                                className={rowStyle.row}
                                aria-pressed={selected}
                                disabled={isDisabled}
                                onClick={() => onSelect(station)}
                            >
                                <span
                                    className={rowStyle.rail}
                                    data-edge={edge}
                                    aria-hidden
                                />
                                <span className={rowStyle.body}>
                                    <span className={rowStyle.line1}>
                                        {code && (
                                            <NumberingBadge
                                                code={code}
                                                color={line.color}
                                                layout="inline"
                                                size="sm"
                                            />
                                        )}
                                        <span className={rowStyle.name}>
                                            {station.name}
                                        </span>
                                        {transfers.length > 0 && (
                                            <span
                                                className={rowStyle.transfers}
                                            >
                                                {transfers.map((transfer) =>
                                                    transfer.code ? (
                                                        <NumberingBadge
                                                            key={
                                                                transfer.lineId
                                                            }
                                                            code={transfer.code}
                                                            color={
                                                                transfer.color
                                                            }
                                                            layout="inline"
                                                            size="sm"
                                                        />
                                                    ) : null,
                                                )}
                                            </span>
                                        )}
                                    </span>
                                    {town && (
                                        <span className={rowStyle.town}>
                                            {town.label}
                                        </span>
                                    )}
                                </span>
                                {town && <TownThumb town={town} size={32} />}
                                {isDisabled && disabled ? (
                                    <span className={rowStyle.tag}>
                                        {disabled.label}
                                    </span>
                                ) : selected ? (
                                    <span
                                        className={rowStyle.check}
                                        aria-hidden
                                    >
                                        <Check strokeWidth={3} />
                                    </span>
                                ) : (
                                    <span
                                        className={rowStyle.radio}
                                        aria-hidden
                                    />
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};
