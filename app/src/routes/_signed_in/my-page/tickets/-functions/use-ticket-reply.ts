import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import type { AddTicketCommentResult } from "../-types/ticket";
import { addTicketComment } from "./add-ticket-comment";
import { isSendableComment } from "./comment-input";

// サーバー関数まで届かなかったときの案内
const NETWORK_ERROR_MESSAGE = "送れませんでした。通信を確かめてください";

/**
 * お問い合わせの返信フォームの状態をまとめるフック。
 * 送信は useMutation で行い、送れたら loader を取り直してスレッドに反映する
 */
export const useTicketReply = (ticketId: number) => {
    const router = useRouter();
    const [content, setContent] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const reply = useMutation({
        mutationFn: (variables: { ticketId: number; content: string }) =>
            addTicketComment({ data: variables }),
        // 二重に書き込まないよう、失敗しても自動では送り直さない
        retry: false,
    });

    const canSend = isSendableComment(content) && !reply.isPending;

    const changeContent = (value: string) => {
        setContent(value);
        // 書き直し始めたら前の失敗の案内は消す
        setErrorMessage(null);
    };

    const submit = async () => {
        if (!canSend) {
            return;
        }
        setErrorMessage(null);
        const result: AddTicketCommentResult = await reply
            .mutateAsync({ ticketId, content })
            .catch(() => ({ ok: false, message: NETWORK_ERROR_MESSAGE }));
        if (!result.ok) {
            setErrorMessage(result.message);
            return;
        }
        setContent("");
        // 書き込んだコメントをスレッドに出すため、詳細の loader を取り直す
        await router.invalidate();
    };

    return {
        content,
        canSend,
        isSending: reply.isPending,
        errorMessage,
        changeContent,
        submit,
    };
};
