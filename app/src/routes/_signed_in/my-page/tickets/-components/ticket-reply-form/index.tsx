import { Button, Field } from "@morinoparty/chlorophyll-react/components";
import type { FormEvent } from "react";
import { sva } from "../../../../../../../styled-system/css";
import { MAX_COMMENT_LENGTH } from "../../-functions/comment-input";

const ticketReplyFormStyle = sva({
    slots: ["root", "textarea", "footer", "counter", "error"],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "3",
        },
        textarea: {
            minHeight: "28",
            resize: "vertical",
        },
        footer: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "3",
        },
        counter: {
            fontSize: "12px",
            fontVariantNumeric: "tabular-nums",
            color: "colorPalette.fg.muted",
            // 上限を超えたら数字だけエラーの色にする
            "&[data-over]": {
                color: "fg.error",
            },
        },
        error: {
            fontSize: "14px",
            fontWeight: "medium",
            lineHeight: "1.5",
            color: "fg.error",
        },
    },
});

export interface TicketReplyFormProps {
    content: string;
    /** 送るボタンを押せるか */
    canSend: boolean;
    isSending: boolean;
    /** 送れなかったときの案内 */
    errorMessage: string | null;
    onContentChange: (content: string) => void;
    onSubmit: () => void;
}

/** お問い合わせへの返信フォーム。本文と文字数、送るボタンだけを置く */
export const TicketReplyForm = ({
    content,
    canSend,
    isSending,
    errorMessage,
    onContentChange,
    onSubmit,
}: TicketReplyFormProps) => {
    const style = ticketReplyFormStyle();
    // API と同じく前後の空白を除いた長さで数える
    const length = content.trim().length;
    const isOver = length > MAX_COMMENT_LENGTH;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit();
    };

    return (
        <form className={style.root} onSubmit={handleSubmit}>
            <Field.Root disabled={isSending} invalid={isOver}>
                <Field.Label>返信</Field.Label>
                <Field.Textarea
                    className={style.textarea}
                    value={content}
                    onChange={(event) => onContentChange(event.target.value)}
                    autoresize
                />
                {/* 送るボタンが押せない理由を、入力欄と結び付けて読み上げさせる */}
                {isOver && (
                    <Field.ErrorText>
                        {MAX_COMMENT_LENGTH}文字までです
                    </Field.ErrorText>
                )}
            </Field.Root>
            {errorMessage && (
                <p className={style.error} role="alert">
                    {errorMessage}
                </p>
            )}
            <div className={style.footer}>
                <span
                    className={style.counter}
                    data-over={isOver ? "" : undefined}
                >
                    {length} / {MAX_COMMENT_LENGTH}
                </span>
                <Button
                    type="submit"
                    intent="primary"
                    disabled={!canSend}
                    aria-busy={isSending || undefined}
                >
                    {isSending ? "送信中…" : "送る"}
                </Button>
            </div>
        </form>
    );
};
