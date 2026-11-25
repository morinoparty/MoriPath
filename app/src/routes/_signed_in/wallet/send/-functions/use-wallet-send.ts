import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type {
    AmountKey,
    Recipient,
    RecipientState,
    SendFailure,
    SendResult,
    WalletSendStep,
} from "../-types/wallet-send";
import {
    applyAmountKey,
    isSendableAmount,
    maxSendableAmount,
} from "./amount-input";
import { MINECRAFT_ID_PATTERN, resolveRecipient } from "./resolve-recipient";
import { sendDonguri } from "./send-donguri";

// 入力が止まってから mc-api に問い合わせるまでの待ち時間
const LOOKUP_DEBOUNCE_MS = 400;

/** 入力が止まってから値を返す */
const useDebouncedValue = (value: string, delayMs: number) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timer);
    }, [value, delayMs]);
    return debounced;
};

// 送り先を引けなかった理由ごとの案内
const RECIPIENT_ERROR_MESSAGES = {
    "not-found": "このMinecraft IDのプレイヤーは見つかりません",
    self: "自分には送れません",
    error: "プレイヤーを確かめられませんでした",
} as const;

/**
 * /wallet/send の状態をまとめるフック。
 * 送り先の検索は TanStack Query、送金は useMutation で行い、画面には表示用の値と操作だけを渡す
 */
export const useWalletSend = (balance: number | null) => {
    const router = useRouter();
    const [recipientName, setRecipientName] = useState("");
    // 候補から選んだ人は UUID が分かっているため、mc-api に問い合わせずに使う
    const [pickedRecipient, setPickedRecipient] = useState<Recipient | null>(
        null,
    );
    const [amount, setAmount] = useState(0);
    const [step, setStep] = useState<WalletSendStep>("input");
    const [sendFailure, setSendFailure] = useState<SendFailure | null>(null);
    const [result, setResult] = useState<SendResult | null>(null);
    // 同じ描画のうちに 2 回押されても 1 回しか送らないための印
    const sendingRef = useRef(false);

    const maxAmount = maxSendableAmount(balance);
    const trimmedName = recipientName.trim();
    const isPicked =
        pickedRecipient !== null &&
        pickedRecipient.name.toLowerCase() === trimmedName.toLowerCase();
    const debouncedName = useDebouncedValue(trimmedName, LOOKUP_DEBOUNCE_MS);
    const isValidName = MINECRAFT_ID_PATTERN.test(trimmedName);

    const lookup = useQuery({
        queryKey: ["wallet", "recipient", debouncedName.toLowerCase()],
        queryFn: () => resolveRecipient({ data: { name: debouncedName } }),
        enabled: !isPicked && MINECRAFT_ID_PATTERN.test(debouncedName),
        // 同じ名前を何度も引かないよう、しばらくは結果を使い回す
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    // 送り先の欄の状態を、選んだ候補・入力の形・検索結果から決める
    const recipientState: RecipientState = (() => {
        if (isPicked && pickedRecipient) {
            return { status: "found", recipient: pickedRecipient };
        }
        if (trimmedName === "") {
            return { status: "empty" };
        }
        if (!isValidName) {
            return {
                status: "error",
                message: "Minecraft IDは英数字と _ の3〜16文字です",
            };
        }
        // 打ち終わるのを待っているあいだと、問い合わせ中は確認中にする
        if (debouncedName !== trimmedName || lookup.isFetching) {
            return { status: "checking" };
        }
        if (lookup.isError) {
            return { status: "error", message: RECIPIENT_ERROR_MESSAGES.error };
        }
        if (!lookup.data) {
            return { status: "checking" };
        }
        return lookup.data.ok
            ? { status: "found", recipient: lookup.data.recipient }
            : {
                  status: "error",
                  message: RECIPIENT_ERROR_MESSAGES[lookup.data.reason],
              };
    })();

    const recipient =
        recipientState.status === "found" ? recipientState.recipient : null;
    // 残高が分からないときは上限を確かめられないため送らせない
    const canSend =
        recipient !== null &&
        balance !== null &&
        isSendableAmount(amount, maxAmount);

    const send = useMutation({
        mutationFn: (variables: { recipient: Recipient; amount: number }) =>
            sendDonguri({
                data: {
                    target: variables.recipient.id,
                    amount: variables.amount,
                },
            }),
        // お金が動く POST なので、失敗しても自動では送り直さない
        retry: false,
    });

    const changeRecipientName = (name: string) => {
        setRecipientName(name);
    };

    const pickRecipient = (picked: Recipient) => {
        setPickedRecipient(picked);
        setRecipientName(picked.name);
    };

    const pressAmountKey = (key: AmountKey) => {
        setAmount((current) => applyAmountKey(current, key, maxAmount));
    };

    const fillAllAmount = () => {
        setAmount(maxAmount);
    };

    const requestConfirm = () => {
        if (canSend) {
            setSendFailure(null);
            setStep("confirm");
        }
    };

    const cancelConfirm = () => {
        // 送信中は閉じさせない (結果を見届けてから閉じる)
        if (!sendingRef.current) {
            setStep("input");
        }
    };

    const confirmSend = async () => {
        if (!recipient || !canSend || sendingRef.current) {
            return;
        }
        sendingRef.current = true;
        setSendFailure(null);
        try {
            const response = await send
                .mutateAsync({ recipient, amount })
                // サーバー関数まで届かなかったときも、送れたかは分からない扱いにする
                .catch((): SendFailure & { ok: false } => ({
                    ok: false,
                    kind: "unknown",
                    message:
                        "送れたかどうか確かめられませんでした。残高を確かめてから、もう一度ためしてください",
                }));
            if (response.ok) {
                setResult({
                    amount: response.amount,
                    balance: response.balance,
                    recipient,
                });
                setStep("done");
            } else {
                setSendFailure({
                    kind: response.kind,
                    message: response.message,
                });
            }
            // 成功時も結果が分からないときも、ホーム・マイページの残高を取り直す
            if (response.ok || response.kind === "unknown") {
                await router.invalidate();
            }
        } finally {
            sendingRef.current = false;
        }
    };

    const sendAnother = () => {
        setAmount(0);
        setResult(null);
        setSendFailure(null);
        setStep("input");
    };

    return {
        recipientName,
        recipientState,
        amount,
        maxAmount,
        canSend,
        step,
        isSending: send.isPending,
        sendFailure,
        result,
        changeRecipientName,
        pickRecipient,
        pressAmountKey,
        fillAllAmount,
        requestConfirm,
        cancelConfirm,
        confirmSend,
        sendAnother,
    };
};
