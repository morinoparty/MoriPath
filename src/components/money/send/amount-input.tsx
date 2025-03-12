"use client";

import { css } from "@/styled-system/css";
import { atom, useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";

// 数字の入力用のatomを定義します。
export const amountAtom = atom<number | undefined>(undefined);
// エラー用のatomを外部で定義します。
const errorAtom = atom<string | null>(null);

type Props = { balance: number; height?: number };
// 入力タイプを定義します（数値入力時とテキスト表示時）
type InputType = "number" | "text";

// 数値のフォーマット関数を定義します
const formatAmount = (inputType: InputType, value: number | undefined) => {
    if (value === undefined) {
        return "";
    }

    switch (inputType) {
        case "number":
            return value.toString();
        case "text":
            return value.toLocaleString("ja-JP");
    }
};

// AmountInputコンポーネントを定義します。
export const AmountInput = ({ balance, height = 48 }: Props) => {
    const [amount, setAmount] = useAtom(amountAtom);
    const [error, setError] = useAtom(errorAtom);
    const [inputType, setInputType] = useState<InputType>("text");
    const isFirst = useRef(true);

    useEffect(() => {
        if (isFirst.current) {
            setAmount(0);
            isFirst.current = false;
        }
    }, [setAmount]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // カンマを取り除いて数値に変換
        const value = Number(e.target.value.replace(/,/g, ""));
        if (value < 1 || !Number.isInteger(value)) {
            setError("1以上の整数を入力してください"); // エラーメッセージを設定
        } else if (value > balance) {
            setError("残高が不足しています");
        } else {
            setError(null); // エラーをクリア
        }
        setAmount(value);
    };

    return (
        <div
            className={css({
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                marginTop: "32px",
                gap: "var(--spacings-radii-15, 6px)",
            })}
        >
            <div
                className={css({
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "var(--spacings-radii-15, 6px)",
                    alignSelf: "stretch",
                })}
            >
                <div
                    className={css({
                        alignSelf: "stretch",
                        fontSize: "var(--typography-size-md, 16px)",
                        fontStyle: "normal",
                        fontWeight: "var(--typography-weight-medium, 500)",
                        lineHeight: "24px /* 150% */",
                    })}
                >
                    送金額
                </div>
                <form
                    className={css({
                        position: "relative",
                        width: "100%",
                    })}
                >
                    <input
                        type={inputType}
                        id="amount"
                        name="amount"
                        placeholder="例えば、1,000"
                        className={css({
                            display: "flex",
                            height: "var(--spacings-radii-12, 48px)",
                            minWidth: "var(--spacings-radii-12, 48px)",
                            width: "100%",
                            // fontFamily: "var(--font-montserrat)",
                            padding: "var(--spacings-radii-0, 0px) var(--spacings-radii-4, 16px)",
                            fontSize: "1.25rem",
                            color: "var(--colors-fg-default)",
                            bgColor: "var(--colors-bg-default)",
                            borderRadius: "lg",
                            border: "1px solid var(--colors-border-default)",
                        })}
                        style={{ height: `${height}px` }}
                        value={formatAmount(inputType, amount)}
                        onChange={handleChange}
                        inputMode={"decimal"}
                        onFocus={() => setInputType("number")}
                        onBlur={() => setInputType("text")}
                    />
                </form>
            </div>
            {error && ( // エラーメッセージを表示
                <div
                    className={css({
                        alignSelf: "stretch",
                        color: "red", // エラーメッセージの色を赤に設定
                        fontSize: "var(--typography-size-sm, 14px)",
                        fontStyle: "normal",
                        fontWeight: "var(--typography-weight-regular, 400)",
                        lineHeight: "20px",
                    })}
                >
                    {error}
                </div>
            )}
            {!error && (
                <div
                    className={css({
                        alignSelf: "stretch",
                        color: "var(--colors-theme-fg-neutral-subtle, #838383)",
                        fontSize: "var(--typography-size-sm, 14px)",
                        fontStyle: "normal",
                        fontWeight: "var(--typography-weight-regular, 400)",
                        lineHeight: "20px",
                    })}
                >
                    1以上の整数を入力してください
                </div>
            )}
        </div>
    );
};
