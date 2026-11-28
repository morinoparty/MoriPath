import { Spinner } from "@morinoparty/chlorophyll-react/components";
import { ChevronRight } from "lucide-react";
import { cx, sva } from "../../../../../../styled-system/css";
import { DIFFICULTY_PALETTE_CLASS } from "../../-functions/difficulty-palette";
import { DIFFICULTY_LABELS } from "../../-functions/quest-difficulty";
import {
    ORDERABLE_DIFFICULTIES,
    type OrderableDifficulty,
} from "../../-types/quest";

const difficultyPickerStyle = sva({
    slots: ["root", "option", "dot", "label", "icon", "note"],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "2",
        },
        // カードと同じ柔らかい面のピル。押せないときは薄くする
        option: {
            display: "flex",
            alignItems: "center",
            gap: "3",
            width: "full",
            height: "56px",
            paddingX: "5",
            border: "none",
            borderRadius: "full",
            bg: "colorPalette.surface.subtle",
            color: "colorPalette.fg",
            cursor: "pointer",
            transition: "background 0.15s",
            _hover: { bg: "colorPalette.surface.hover" },
            _disabled: {
                cursor: "not-allowed",
                opacity: "0.5",
                _hover: { bg: "colorPalette.surface.subtle" },
            },
            _focusVisible: {
                outline: "2px solid",
                outlineColor: "colorPalette.9",
                outlineOffset: "2px",
            },
        },
        // 難易度の色を小さな丸で見せる
        dot: {
            flexShrink: "0",
            width: "3",
            height: "3",
            borderRadius: "full",
            bg: "colorPalette.solid",
        },
        label: {
            flex: "1",
            textAlign: "left",
            textStyle: "md",
            fontWeight: "bold",
        },
        icon: {
            width: "5",
            height: "5",
            color: "colorPalette.fg.muted",
        },
        note: {
            textStyle: "sm",
            color: "colorPalette.fg.muted",
            textAlign: "center",
        },
    },
});

export interface DifficultyPickerProps {
    /** 受けられないとき (サーバーにいないなど) は理由を出し、選べなくする */
    disabledReason: string | null;
    /** 受けている最中の難易度。その行にスピナーを出し、ほかも押せなくする */
    orderingDifficulty: OrderableDifficulty | null;
    onSelect: (difficulty: OrderableDifficulty) => void;
}

/** その日のクエストを受ける前の難易度選び。ゲーム内の受付嬢の選択肢と同じ 3 つ */
export const DifficultyPicker = ({
    disabledReason,
    orderingDifficulty,
    onSelect,
}: DifficultyPickerProps) => {
    const style = difficultyPickerStyle();
    const disabled = disabledReason !== null || orderingDifficulty !== null;

    return (
        <div className={style.root}>
            {ORDERABLE_DIFFICULTIES.map((difficulty) => (
                <button
                    key={difficulty}
                    type="button"
                    className={cx(
                        style.option,
                        DIFFICULTY_PALETTE_CLASS[difficulty],
                    )}
                    disabled={disabled}
                    aria-busy={orderingDifficulty === difficulty}
                    onClick={() => onSelect(difficulty)}
                >
                    <span className={style.dot} aria-hidden />
                    <span className={style.label}>
                        {DIFFICULTY_LABELS[difficulty]}
                    </span>
                    {orderingDifficulty === difficulty ? (
                        <Spinner size="sm" />
                    ) : (
                        <ChevronRight className={style.icon} aria-hidden />
                    )}
                </button>
            ))}
            {disabledReason && <p className={style.note}>{disabledReason}</p>}
        </div>
    );
};
