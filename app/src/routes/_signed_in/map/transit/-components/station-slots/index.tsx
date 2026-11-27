import { IconButton } from "@morinoparty/chlorophyll-react/components";
import { ArrowUpDown, Check } from "lucide-react";
import { css, sva } from "../../../../../../../styled-system/css";
import { NumberingBadge } from "../../../-components/numbering-badge";
import { slotLabel } from "../../-functions/transit-search";
import type { TransitSlot, TransitStation } from "../../-types/transit";

const stationSlotsStyle = sva({
    slots: [
        "root",
        "slots",
        "slot",
        "label",
        "name",
        "placeholder",
        "spacer",
        "done",
    ],
    base: {
        // 出発と到着の枠を縦に並べ、右に入れかえボタンを置くカード
        root: {
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px",
            borderRadius: "panel",
            bg: "colorPalette.surface.subtle",
        },
        slots: {
            flex: "1",
            minWidth: "0",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
        },
        // 枠は押すとその枠を選び直せるピル
        slot: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minHeight: "40px",
            paddingLeft: "6px",
            paddingRight: "14px",
            paddingY: "6px",
            borderRadius: "full",
            bg: "colorPalette.surface",
            color: "colorPalette.fg",
            textAlign: "left",
            cursor: "pointer",
            transitionProperty: "background, color",
            transitionDuration: "fast",
            // いま選んでいる枠は塗りを保つため、hover はほかの枠だけにする
            "&:not([aria-current=true]):hover": {
                bg: "colorPalette.surface.hover",
            },
            _focusVisible: {
                outline: "2px solid {colors.colorPalette.solid}",
                outlineOffset: "2px",
            },
            // いま選んでいる枠はブランド色で塗る
            "&[aria-current=true]": {
                bg: "colorPalette.solid",
                color: "colorPalette.contrast",
            },
        },
        label: {
            flexShrink: 0,
            px: "12px",
            py: "4px",
            borderRadius: "full",
            bg: "colorPalette.surface.subtle",
            fontSize: "13px",
            fontWeight: "bold",
            lineHeight: "1.3",
            color: "colorPalette.fg",
            "[aria-current=true] &": { bg: "bg.panel" },
        },
        name: {
            minWidth: "0",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "14px",
            fontWeight: "bold",
        },
        // 選ぶ前の枠の案内。選んでいない枠では控えめにする
        placeholder: {
            fontSize: "14px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            "&[data-active=false]": {
                color: "fg.muted",
                fontWeight: "medium",
            },
        },
        spacer: {
            flex: "1",
        },
        // 決まった枠のしるし
        done: {
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            width: "20px",
            height: "20px",
            borderRadius: "full",
            bg: "colorPalette.solid",
            color: "colorPalette.contrast",
            "& svg": { width: "12px", height: "12px" },
        },
    },
});

// 入れかえボタンはカードの地の上で浮かないよう、枠と同じ面の色にする
const swapStyle = css({
    flexShrink: 0,
    width: "40px",
    height: "40px",
    minWidth: "40px",
    bg: "colorPalette.surface",
    color: "colorPalette.fg",
    _hover: { bg: "colorPalette.surface.hover" },
    "& svg": { width: "18px", height: "18px" },
});

export interface StationSlotsProps {
    /** 出発の駅 (決まった駅、または出発を選んでいる途中の駅) */
    from: TransitStation | null;
    /** 到着の駅 (決まった駅、または到着を選んでいる途中の駅) */
    to: TransitStation | null;
    /** いま選んでいる枠。両方決まっていれば null */
    activeSlot: TransitSlot | null;
    onEditSlot: (slot: TransitSlot) => void;
    onSwap: () => void;
}

/** 出発・到着の枠と入れかえボタン */
export const StationSlots = ({
    from,
    to,
    activeSlot,
    onEditSlot,
    onSwap,
}: StationSlotsProps) => {
    const style = stationSlotsStyle();
    const stations: Record<TransitSlot, TransitStation | null> = { from, to };
    return (
        <div className={style.root}>
            <div className={style.slots}>
                {(["from", "to"] as const).map((slot) => {
                    const station = stations[slot];
                    const active = activeSlot === slot;
                    // 枠には最初の番号を添える (番号の無い駅は名前だけ)
                    const numbering = station?.numberings.find(
                        (n) => n.code !== null,
                    );
                    return (
                        <button
                            key={slot}
                            type="button"
                            className={style.slot}
                            aria-current={active ? "true" : undefined}
                            onClick={() => onEditSlot(slot)}
                        >
                            <span className={style.label}>
                                {slotLabel[slot]}
                            </span>
                            {station ? (
                                <>
                                    {numbering?.code && (
                                        <NumberingBadge
                                            code={numbering.code}
                                            color={numbering.color}
                                            layout="inline"
                                            size="sm"
                                        />
                                    )}
                                    <span className={style.name}>
                                        {station.name}
                                    </span>
                                    <span className={style.spacer} />
                                    {!active && (
                                        <span
                                            className={style.done}
                                            aria-hidden
                                        >
                                            <Check strokeWidth={3} />
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span
                                    className={style.placeholder}
                                    data-active={active}
                                >
                                    {active
                                        ? "ここを選んでいます"
                                        : "えらんでください"}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
            <IconButton
                variant="ghost"
                shape="circle"
                className={swapStyle}
                aria-label="出発と到着を入れかえる"
                disabled={from === null && to === null}
                onClick={onSwap}
            >
                <ArrowUpDown />
            </IconButton>
        </div>
    );
};
