"use client";
import { css } from "@/styled-system/css";
import { useAtom } from "jotai";
import { Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { amountAtom } from "~/components/money/send/amount-input";
import { TransactionError } from "~/components/money/send/dialog/transaction-error";
import { TransactionInvalid } from "~/components/money/send/dialog/transaction-invalid";
import { TransactionSuccess } from "~/components/money/send/dialog/transaction-success";
import { usernameAtom } from "~/components/money/send/username-input";
import { Button } from "~/components/ui/button";
import type { ExtendedSession } from "~/lib/auth";
import { nameToUUID, validateUsername } from "~/utils/player-helpers";
import { Dialog } from "../../ui/dialog";

type Props = {
    balance: number;
    currentUser: string;
};

export const SendButton = ({ balance, currentUser }: Props) => {
    const [username] = useAtom(usernameAtom);
    const [amount] = useAtom(amountAtom);
    const { data: session } = useSession();
    const sessionData = session as ExtendedSession;

    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<"success" | "invalid" | "error">("success");

    const onSubmit = async (event: React.FormEvent) => {
        if ((await validateUsername(username, currentUser)) !== null) {
            return;
        }

        event.preventDefault(); // フォームのデフォルトの送信動作を防ぐ
        const target = await nameToUUID(username);

        const res = await fetch("/main/api/v1/plugins/vault/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionData?.accessToken}`,
            },
            body: JSON.stringify({
                target: target,
                amount: amount,
            }),
        });

        switch (res.status) {
            case 200:
                setStatus("success");
                setIsOpen(true);
                break;
            case 400:
                setStatus("invalid");
                setIsOpen(true);
                break;
            default:
                setStatus("error");
                setIsOpen(true);
                break;
        }
    };

    return (
        <>
            <div
                className={css({
                    display: "flex",
                    marginTop: "64px",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                })}
            >
                <div
                    className={css({
                        textAlign: "center",
                        fontFamily: 'var(--typography-family-body, "Plus Jakarta Sans")',
                        fontSize: "sm",
                        fontStyle: "normal",
                        fontWeight: "var(--typography-weight-regular, 400)",
                        lineHeight: "20px /* 142.857% */",
                    })}
                >
                    送金後の残高: {(balance - (amount ?? 0)).toLocaleString()}円
                </div>
                <Button
                    className={css({
                        height: "var(--spacing-12, 48px)",
                        fontSize: "lg",
                        padding: "0 40px",
                        maxW: "xs",
                    })}
                    onClick={onSubmit}
                >
                    お金を送る
                    <Send />
                </Button>
                <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                    {status === "success" && <TransactionSuccess />}
                    {status === "error" && <TransactionError />}
                    {status === "invalid" && <TransactionInvalid />}
                </Dialog.Root>
            </div>
        </>
    );
};
