"use client";

import { css } from "@/styled-system/css";
import { atom, useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { validateUsername } from "~/utils/player-helpers";

export const usernameAtom = atom<string>("");
const headImageAtom = atom((get) => {
    const username = get(usernameAtom);
    return `https://crafthead.net/avatar/${username}/64`;
});

const errorAtom = atom<string | null>(null);

// APIレスポンスの型定義
interface UserExistsResponse {
    exists: boolean;
}

// 'atom'は型として使用するのではなく、'typeof atom'を使用する必要があります。
type Props = { initialValue: string | undefined; height?: number; currentUser?: string };

// UsernameInputコンポーネントを定義します。
export const UsernameInput = ({ initialValue, height = 48, currentUser }: Props) => {
    const [username, setUsername] = useAtom(usernameAtom);
    const [error, setError] = useAtom(errorAtom); // 外部で定義したatomを使用
    const [isValidating, setIsValidating] = useState(false);
    const isFirst = useRef(true);

    useEffect(() => {
        if (initialValue || isFirst) {
            setUsername(initialValue ?? "");
            isFirst.current = false;
        }
    }, [initialValue, setUsername]);

    const [headImage] = useAtom(headImageAtom);
    const spacing = "0.85rem";
    const locked = initialValue !== undefined;

    // フォーカスが外れたときにユーザー名を検証
    const handleBlur = async () => {
        if (locked) return; // 初期値が設定されている場合は検証しない

        setIsValidating(true);
        const validationError = await validateUsername(username, currentUser);
        setError(validationError);
        setIsValidating(false);
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
                    送金先のMinecraft ID
                </div>
                <form
                    className={css({
                        position: "relative",
                        width: "100%",
                    })}
                >
                    <img
                        src={headImage}
                        className={css({
                            position: "absolute",
                            borderRadius: "lg",
                        })}
                        style={{
                            height: `calc(${height}px - ${spacing})`,
                            width: `calc(${height}px - ${spacing})`,
                            bottom: `calc(${spacing} /2)`,
                            right: `calc(${spacing} /2)`,
                            borderRadius: `calc((${height}px - ${spacing}) / 8)`,
                        }}
                        alt="Player head"
                    />
                    <input
                        type="text"
                        id="playerName"
                        name="PlayerName"
                        placeholder="例えば、Chocolatt"
                        className={css({
                            display: "flex",
                            height: "var(--spacings-radii-12, 48px)",
                            minWidth: "var(--spacings-radii-12, 48px)",
                            width: "100%",
                            padding: "var(--spacings-radii-0, 0px) var(--spacings-radii-4, 16px)",
                            fontSize: "1.25rem",
                            color: locked ? "var(--colors-fg-muted)" : "var(--colors-fg-default)",
                            bgColor: locked ? "var(--colors-bg-muted)" : "var(--colors-bg-default)",
                            borderRadius: "lg",
                            border: "1px solid var(--colors-border-default)",
                        })}
                        style={{ height: `${height}px` }}
                        value={username}
                        readOnly={locked}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setUsername(e.target.value);
                            // 入力中はエラーをクリア
                            if (error) setError(null);
                        }}
                        onBlur={handleBlur}
                    />
                    {/* {isValidating && (
                        <div
                            className={css({
                                position: "absolute",
                                right: "calc(48px + 8px)",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "var(--colors-fg-muted)",
                                fontSize: "14px",
                            })}
                        >
                            検証中...
                        </div>
                    )} */}
                </form>
            </div>
            {error && ( // エラーメッセージを表示
                <div
                    className={css({
                        alignSelf: "stretch",
                        color: "red", // エラーメッセージの色を赤に設定
                        fontFamily: 'var(--typography-family-body, "Plus Jakarta Sans")',
                        fontSize: "var(--typography-size-sm, 14px)",
                        fontStyle: "normal",
                        fontWeight: "var(--typography-weight-regular, 400)",
                        lineHeight: "20px",
                    })}
                >
                    {error}
                </div>
            )}
        </div>
    );
};
