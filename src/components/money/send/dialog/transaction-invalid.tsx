"use client";
import { Dialog } from "@/src/components/ui/dialog";
import { css, cx } from "@/styled-system/css";
import { Stack } from "@/styled-system/jsx";
import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { IconButton } from "~/components/ui/icon-button";

export const TransactionInvalid = () => {
    const route = useRouter();

    return (
        <Dialog.Positioner>
            <Dialog.Content>
                <Stack gap="8" p="6">
                    <Stack gap="1">
                        <Dialog.Title className={css({ color: "#E5484D" })}>送金に失敗しました</Dialog.Title>
                        <Dialog.Description>入力された値が正しくありません。</Dialog.Description>
                    </Stack>
                    <div
                        className={css({
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "var(--spacings-radii-2, 8px)",
                            alignSelf: "stretch",
                        })}
                    >
                        <Dialog.CloseTrigger asChild>
                            <Button
                                variant="outline"
                                className={cx(
                                    buttonStyles,
                                    css({
                                        background: "var(--colors-theme-bg-accent-default, #FFF)",
                                    }),
                                )}
                            >
                                閉じる
                            </Button>
                        </Dialog.CloseTrigger>
                        <Button
                            className={cx(buttonStyles)}
                            onClick={() => {
                                route.push("/");
                            }}
                        >
                            ホームに戻る
                        </Button>
                    </div>
                </Stack>
                <Dialog.CloseTrigger asChild position="absolute" top="2" right="2">
                    <IconButton aria-label="Close Dialog" variant="ghost" size="sm">
                        <XIcon />
                    </IconButton>
                </Dialog.CloseTrigger>
            </Dialog.Content>
        </Dialog.Positioner>
    );
};

const buttonStyles = css({
    display: "flex",
    fontSize: "sm",
    height: "var(--spacings-radii-9, 36px)",
    minWidth: "var(--spacings-radii-9, 36px)",
    justifyContent: "center",
    alignItems: "center",
    gap: "var(--spacings-radii-2, 8px)",
    flex: "1 0 0",
    borderRadius: "md",
    fontWeight: "500",
});
