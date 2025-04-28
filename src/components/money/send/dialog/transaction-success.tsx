"use client";
import { Dialog } from "@/src/components/ui/dialog";
import { css, cx } from "@/styled-system/css";
import { Stack } from "@/styled-system/jsx";
import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { IconButton } from "~/components/ui/icon-button";

export const TransactionSuccess = () => {
  const route = useRouter();

  return (
    <Dialog.Positioner>
      <Dialog.Content>
        <Stack gap="8" p="6">
          <Stack gap="1">
            <Dialog.Title>送金に成功しました。</Dialog.Title>
            {/*<Dialog.Description>Dialog Description</Dialog.Description>*/}
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
            <Button
              variant="outline"
              className={cx(
                buttonStyles,
                css({
                  fontWeight: 500,
                  background: "var(--colors-theme-bg-accent-default, #FFF)",
                }),
              )}
              onClick={() => {
                window.location.href = window.location.href.split("?")[0];
              }}
            >
              続けて送る
            </Button>
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
