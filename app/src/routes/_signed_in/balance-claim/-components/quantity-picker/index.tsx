import { Minus, Plus } from "lucide-react";
import { useId, useState } from "react";
import { sva } from "../../../../../../styled-system/css";
import {
    formatNumber,
    MAX_BLOCK_COUNT,
    MIN_BLOCK_COUNT,
    parseBlockCountDraft,
} from "../../-functions/block-count";

// 丸いボタンと数の欄に共通のフォーカス表示
const focusRing = {
    outlineWidth: "2px",
    outlineStyle: "solid",
    outlineColor: "colorPalette.focusRing",
    outlineOffset: "2px",
} as const;

const quantityPickerStyle = sva({
    slots: [
        "root",
        "label",
        "stepper",
        "step",
        "value",
        "input",
        "unit",
        "presets",
        "preset",
    ],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4",
            width: "full",
            paddingTop: "3",
        },
        label: {
            fontSize: "12px",
            fontWeight: "medium",
            lineHeight: "1.5",
            color: "colorPalette.fg.muted",
        },
        stepper: {
            display: "flex",
            alignItems: "center",
            gap: "5",
        },
        // 面だけの丸いボタン。押しているあいだは少し沈める
        step: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: "0",
            width: "52px",
            height: "52px",
            borderRadius: "full",
            bg: "colorPalette.surface.subtle",
            color: "colorPalette.fg",
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
            transition: "transform 0.1s",
            _active: { transform: "scale(0.94)" },
            _disabled: {
                color: "fg.disabled",
                cursor: "not-allowed",
                transform: "none",
            },
            _focusVisible: focusRing,
            "& > svg": { width: "6", height: "6" },
        },
        value: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "150px",
        },
        // 大きな数字そのものを入力欄にする。けたが増えたら文字を小さくして幅に収める
        input: {
            width: "full",
            padding: "0",
            border: "none",
            bg: "transparent",
            textAlign: "center",
            fontSize: "56px",
            fontWeight: "bold",
            lineHeight: "1.2",
            fontVariantNumeric: "tabular-nums",
            color: "colorPalette.fg",
            borderRadius: "control",
            _focusVisible: focusRing,
            _disabled: { opacity: "1", cursor: "not-allowed" },
            "&[data-digits='5']": { fontSize: "44px" },
            "&[data-digits='6']": { fontSize: "36px" },
        },
        unit: {
            fontSize: "14px",
            fontWeight: "medium",
            lineHeight: "1.5",
            color: "colorPalette.fg.muted",
        },
        presets: {
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "2",
        },
        preset: {
            paddingX: "4",
            paddingY: "2",
            borderRadius: "full",
            bg: "colorPalette.surface.subtle",
            fontSize: "14px",
            fontWeight: "bold",
            lineHeight: "1.5",
            color: "colorPalette.fg",
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
            _disabled: { color: "fg.disabled", cursor: "not-allowed" },
            _focusVisible: focusRing,
        },
    },
});

// 今の数に足すボタン
const ADD_PRESETS = [100, 500, 1000] as const;

export interface QuantityPickerProps {
    /** 買うブロック数 (1 以上の整数) */
    count: number;
    /** 残高で買える最大のブロック数。単価か残高が分からなければ null (「最大」を押せない) */
    maxBlocks: number | null;
    /** 数を入れ直したとき。範囲外や小数は受け取った側で丸める */
    onCountChange: (count: number) => void;
    /** 「+100」などで足すとき */
    onAdd: (delta: number) => void;
    /** 「最大」を押したとき */
    onFillMax: () => void;
    /** 購入中など、操作を止めたいとき */
    disabled?: boolean;
}

/** 買うブロック数を選ぶ部分。− / + の丸いボタン、直接入力できる大きな数字、足すボタンを並べる */
export const QuantityPicker = ({
    count,
    maxBlocks,
    onCountChange,
    onAdd,
    onFillMax,
    disabled = false,
}: QuantityPickerProps) => {
    const style = quantityPickerStyle();
    const labelId = useId();
    // 入力中の文字。空にして打ち直せるよう、フォーカス中だけ数とは別に持つ
    const [draft, setDraft] = useState<string | null>(null);

    // 1 ブロックも買えないと分かっているときは、増やす操作をすべて止める
    const cannotAdd = disabled || maxBlocks === 0;
    const shownValue = draft ?? formatNumber(count);
    const digits = (draft ?? String(count)).length;

    const handleChange = (text: string) => {
        // 数字以外は捨て、上限のけた数で打ち切る
        const nextDraft = text
            .replace(/\D/g, "")
            .slice(0, String(MAX_BLOCK_COUNT).length);
        setDraft(nextDraft);
        const parsed = parseBlockCountDraft(nextDraft);
        // 打っているあいだも合計を追えるよう、読める数になったらすぐ渡す
        if (parsed !== null) {
            onCountChange(parsed);
        }
    };

    return (
        <section className={style.root} aria-labelledby={labelId}>
            <span className={style.label} id={labelId}>
                買う数
            </span>
            <div className={style.stepper}>
                <button
                    type="button"
                    className={style.step}
                    onClick={() => onAdd(-1)}
                    disabled={disabled || count <= MIN_BLOCK_COUNT}
                    aria-label="1 ブロック減らす"
                >
                    <Minus aria-hidden />
                </button>
                <label className={style.value}>
                    <input
                        className={style.input}
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        aria-labelledby={labelId}
                        value={shownValue}
                        data-digits={digits > 4 ? String(digits) : undefined}
                        onFocus={() => setDraft(String(count))}
                        onChange={(event) => handleChange(event.target.value)}
                        // 離れたら数に戻す。空や 0 のまま離れても、受け取った側で 1 以上にそろえた数を出す
                        onBlur={() => setDraft(null)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.currentTarget.blur();
                            }
                        }}
                        disabled={disabled}
                    />
                    <span className={style.unit}>ブロック</span>
                </label>
                <button
                    type="button"
                    className={style.step}
                    onClick={() => onAdd(1)}
                    disabled={cannotAdd || count >= MAX_BLOCK_COUNT}
                    aria-label="1 ブロック増やす"
                >
                    <Plus aria-hidden />
                </button>
            </div>
            <div className={style.presets}>
                {ADD_PRESETS.map((delta) => (
                    <button
                        key={delta}
                        type="button"
                        className={style.preset}
                        onClick={() => onAdd(delta)}
                        disabled={cannotAdd || count >= MAX_BLOCK_COUNT}
                    >
                        +{formatNumber(delta)}
                    </button>
                ))}
                <button
                    type="button"
                    className={style.preset}
                    onClick={onFillMax}
                    disabled={disabled || maxBlocks === null || maxBlocks === 0}
                >
                    最大
                </button>
            </div>
        </section>
    );
};
