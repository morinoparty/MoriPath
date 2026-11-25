import { Delete } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { sva } from "../../../../../../../styled-system/css";
import { formatNumber } from "../../../../../../lib/format-number";
import { toAmountKey } from "../../-functions/amount-input";
import type { AmountKey } from "../../-types/wallet-send";

const amountPadStyle = sva({
    slots: [
        "root",
        "display",
        "label",
        "value",
        "caret",
        "balance",
        "all",
        "keypad",
        "key",
    ],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "5",
            width: "full",
        },
        display: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1",
        },
        label: {
            fontSize: "12px",
            fontWeight: "medium",
            lineHeight: "1.5",
            color: "colorPalette.fg.muted",
        },
        value: {
            display: "flex",
            alignItems: "center",
            gap: "1",
            fontSize: "48px",
            fontWeight: "bold",
            lineHeight: "1.25",
            fontVariantNumeric: "tabular-nums",
            color: "colorPalette.fg",
            // 未入力のときは 0 を薄く出す
            "&[data-empty]": { color: "colorPalette.fg.muted" },
        },
        // 入力位置を示す縦線
        caret: {
            width: "3px",
            height: "11",
            borderRadius: "2px",
            bg: "colorPalette.solid",
        },
        balance: {
            display: "flex",
            alignItems: "center",
            gap: "2",
            fontSize: "14px",
            fontWeight: "medium",
            lineHeight: "1.5",
            color: "colorPalette.fg.muted",
            whiteSpace: "nowrap",
        },
        all: {
            fontWeight: "bold",
            color: "colorPalette.solid",
            cursor: "pointer",
            borderRadius: "4px",
            _disabled: { color: "fg.disabled", cursor: "not-allowed" },
            _focusVisible: {
                outlineWidth: "2px",
                outlineStyle: "solid",
                outlineColor: "colorPalette.focusRing",
                outlineOffset: "2px",
            },
        },
        keypad: {
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
        },
        // 枠や面を持たない文字だけのキー。押しているあいだだけ淡い面を出す
        key: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "58px",
            fontSize: "24px",
            fontWeight: "medium",
            lineHeight: "1.5",
            color: "colorPalette.fg",
            borderRadius: "panel",
            cursor: "pointer",
            userSelect: "none",
            WebkitTapHighlightColor: "transparent",
            transition: "background 0.1s",
            _active: { bg: "colorPalette.surface.subtle" },
            _disabled: { color: "fg.disabled", cursor: "not-allowed" },
            _focusVisible: {
                outlineWidth: "2px",
                outlineStyle: "solid",
                outlineColor: "colorPalette.focusRing",
            },
            "& > svg": { width: "6", height: "6" },
        },
    },
});

// キーパッドの並び。電話と同じく 1 が左上、最下段は 00 / 0 / ⌫
const KEYPAD_KEYS: readonly AmountKey[] = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "00",
    "0",
    "backspace",
];

/** リンクやボタンにフォーカスがあるときの Enter は、その要素の操作に任せる */
const isInteractiveTarget = (target: EventTarget | null): boolean =>
    target instanceof HTMLElement &&
    target.closest("a, button, [role='button']") !== null;

/** 入力中の文字入力欄などにいるときは、物理キーボードの数字を金額に回さない */
const isTypingTarget = (target: EventTarget | null): boolean =>
    target instanceof HTMLElement &&
    (target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

export interface AmountPadProps {
    /** 送る金額。0 は未入力 */
    amount: number;
    /** いまの残高。取れなかったときは null */
    balance: number | null;
    onKey: (key: AmountKey) => void;
    /** 「ぜんぶ」を押したとき */
    onFillAll: () => void;
    /** 物理キーボードで Enter を押したとき (確認へ進む) */
    onSubmit?: () => void;
    /** 確認ダイアログを開いているあいだなど、入力を止めたいとき */
    disabled?: boolean;
}

/** 送る金額の表示と数字のキーパッド。物理キーボードの数字・Backspace・Enter も受け付ける */
export const AmountPad = ({
    amount,
    balance,
    onKey,
    onFillAll,
    onSubmit,
    disabled = false,
}: AmountPadProps) => {
    const style = amountPadStyle();
    // リスナーを張り直さずに最新の操作を呼ぶための保持
    const handlersRef = useRef({ onKey, onSubmit });
    useEffect(() => {
        handlersRef.current = { onKey, onSubmit };
    }, [onKey, onSubmit]);
    const labelId = useId();

    useEffect(() => {
        if (disabled) {
            return;
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            // ショートカットや、送り先の入力欄での入力は横取りしない
            if (
                event.metaKey ||
                event.ctrlKey ||
                event.altKey ||
                isTypingTarget(event.target)
            ) {
                return;
            }
            if (event.key === "Enter") {
                // 戻るリンクや候補のリンクで Enter を押したときに、確認を開かない
                if (isInteractiveTarget(event.target)) {
                    return;
                }
                handlersRef.current.onSubmit?.();
                return;
            }
            const key = toAmountKey(event.key);
            if (key) {
                event.preventDefault();
                handlersRef.current.onKey(key);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [disabled]);

    const isEmpty = amount === 0;
    return (
        <div className={style.root}>
            <div className={style.display}>
                <span className={style.label} id={labelId}>
                    送る金額
                </span>
                {/* 金額が変わるたびに読み上げる */}
                <output
                    className={style.value}
                    aria-labelledby={labelId}
                    aria-live="polite"
                    data-empty={isEmpty ? "" : undefined}
                >
                    {formatNumber(amount)}
                    <span className={style.caret} aria-hidden />
                </output>
                {balance === null ? (
                    <p className={style.balance}>残高を読み込めませんでした</p>
                ) : (
                    <p className={style.balance}>
                        <span>
                            残高 {formatNumber(balance)} →{" "}
                            {formatNumber(balance - amount)} どんぐり
                        </span>
                        <button
                            type="button"
                            className={style.all}
                            onClick={onFillAll}
                            disabled={disabled}
                        >
                            ぜんぶ
                        </button>
                    </p>
                )}
            </div>
            <div className={style.keypad}>
                {KEYPAD_KEYS.map((key) => (
                    <button
                        key={key}
                        type="button"
                        className={style.key}
                        onClick={() => onKey(key)}
                        disabled={disabled}
                        aria-label={
                            key === "backspace" ? "1けた消す" : undefined
                        }
                    >
                        {key === "backspace" ? <Delete aria-hidden /> : key}
                    </button>
                ))}
            </div>
        </div>
    );
};
