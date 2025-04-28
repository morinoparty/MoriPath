"use client";

import nullAvatar from "@/public/null.png";
import { css, sva } from "@/styled-system/css";
import { Portal } from "@ark-ui/react";
import { faker } from "@faker-js/faker";
import { type PanInfo, motion, useMotionValue, useSpring } from "framer-motion";
import { XIcon } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useEffect, useState } from "react";
import { IconButton } from "~/components/ui/icon-button";
import * as Dialog from "../../ui/styled/dialog";

export interface PlayerDrawerContentProps {
  children: React.ReactNode;
  uuid: string;
  playerName: string;
  playerServer: string;
  randomText: string;
  backgroundColor: string;
  headerHeight: number;
  iconSize: number;
}

const MotionDialogContent = motion.create(Dialog.Content);

const playerDrawer = sva({
  slots: [
    "root",
    "trigger",
    "positioner",
    "contentWrapper",
    "handle",
    "content",
    "contentContainer",
    "avatarContainer",
    "playerInfo",
    "closeButton",
    "title",
    "randomText",
    "description",
    "motionContent",
  ],
  base: {
    root: {},
    trigger: { flexShrink: 0 },
    positioner: {},
    contentWrapper: {
      width: "100%",
      maxWidth: "md",
      borderRadius: "32px 32px 0 0",
      overflow: "hidden",
      margin: "0 auto",
      boxShadow: "md",
      bgColor: "background",
    },
    handle: {
      position: "absolute",
      margin: "0 auto",
      width: "100%",
      height: "24px",
      borderRadius: "full",
      zIndex: "10",
      flexShrink: 0,
      left: "0",
      right: "0",
      top: "calc(var(--header-height) - 8px - (var(--handle-height) * 2))",
      _before: {
        top: "8px",
        content: '""',
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        width: "4px",
        minWidth: "64px",
        height: "4px",
        borderRadius: "full",
        bg: "gray",
      },
    },
    content: {
      width: { base: "100vw", md: "md" },
      padding: "0 24px",
      margin: "0 auto",
      position: "relative",
      height: "calc(100vh - 300px)",
      display: "flex",
      flexDirection: "column",
      wordWrap: "break-word",
      overflowWrap: "break-word",
      whiteSpace: "pre-wrap",
      overflowY: "auto",
      flex: "1",
      scrollbarWidth: "none",
      bgColor: "white",
      zIndex: "1",
      "&::-webkit-scrollbar": { display: "none" },
      "&::before": {
        content: '""',
        position: "absolute",
        bgColor: "var(--background-color)",
        top: "0",
        left: "0",
        right: "0",
        height: "var(--drawer-heading-height)",
        width: "100%",
        zIndex: "2",
      },
    },
    contentContainer: {
      width: "100%",
      maxWidth: "md",
      paddingTop: "2",
    },
    avatarContainer: {
      width: "var(--icon-size)",
      height: "var(--icon-size)",
      bgColor: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    playerInfo: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    closeButton: {
      position: "absolute",
      top: "4",
      right: "4",
      zIndex: "2",
    },
    title: {
      fontSize: "2xl",
      fontWeight: "bold",
    },
    randomText: {
      fontSize: "xs",
    },
    description: {
      fontSize: "xs",
    },
    motionContent: {
      position: "absolute",
      bottom: "0",
      zIndex: "1000",
      width: "100%",
      bgColor: "rgba(0, 0, 0, 0)",
      border: "none !important",
      boxShadow: "none !important",
    },
  },
});

export const PlayerDrawerContent: React.FC<PlayerDrawerContentProps> = ({
  children,
  uuid,
  playerName,
  playerServer,
  randomText,
  backgroundColor,
  headerHeight,
  iconSize,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const y = useMotionValue(0);
  const ySpring = useSpring(y, { stiffness: 300, damping: 30 });

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 60) {
      setIsOpen(false);
      y.set(0);
    } else {
      y.set(0);
    }
  };

  const styles = playerDrawer();

  return (
    <Dialog.Root open={isOpen} onOpenChange={(details) => setIsOpen(details.open)}>
      <Dialog.Trigger className={styles.trigger}>{children}</Dialog.Trigger>

      <Dialog.Positioner className={styles.positioner}>
        <Portal>
          {isOpen && (
            <MotionDialogContent
              className={styles.motionContent}
              style={{
                y: ySpring,
              }}
            >
              <div className={styles.contentWrapper}>
                <motion.div
                  className={styles.handle}
                  style={{ "--handle-height": "8px" } as React.CSSProperties}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  onDrag={(e, info) => {
                    y.set(info.point.y - 300);
                  }}
                  dragElastic={0}
                  onDragEnd={handleDragEnd}
                />
                <div
                  className={styles.content}
                  style={
                    {
                      "--background-color": backgroundColor,
                      "--drawer-border-radius": "32px 32px 0 0",
                      "--drawer-heading-height": `${headerHeight}px`,
                      translateY: y,
                    } as React.CSSProperties
                  }
                >
                  <motion.div className={css({ height: "100%", display: "flex", flexDirection: "column" })}>
                    <div className={styles.contentContainer}>
                      <div
                        className={css({
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          alignSelf: "stretch",
                          paddingTop:
                            "calc(var(--header-height) - 8px - (var(--handle-height) * 2) - (var(--icon-size)/2))",
                        })}
                        style={
                          {
                            "--header-height": `${headerHeight}px`,
                            "--icon-size": `${iconSize + 16}px`,
                            "--handle-height": "8px",
                          } as React.CSSProperties
                        }
                      >
                        <div className={styles.avatarContainer}>
                          <Image
                            className={css({
                              borderRadius: "xl",
                              zIndex: "3",
                            })}
                            src={`https://crafthead.net/avatar/${uuid}`}
                            placeholder="blur"
                            blurDataURL={nullAvatar.src}
                            alt={uuid}
                            width={iconSize}
                            height={iconSize}
                          />
                        </div>
                        <div className={styles.playerInfo}>
                          <div
                            className={css({
                              display: "flex",
                              alignItems: "flex-end",
                              gap: "16px",
                            })}
                          >
                            <Dialog.Title className={styles.title}>{playerName}</Dialog.Title>
                            <div className={styles.randomText}>{randomText}</div>
                          </div>
                          <Dialog.Description className={styles.description}>
                            <div>{playerServer}</div>
                            {isOpen.toString()}
                            {Array.from({ length: 14 }).map((_, i) => (
                              <div
                                key={`paragraph-${
                                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                  i
                                }`}
                              >
                                {faker.lorem.paragraph()}
                              </div>
                            ))}
                          </Dialog.Description>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  <Dialog.CloseTrigger
                    onClick={() => {
                      setIsOpen(false);
                    }}
                    asChild
                  >
                    <IconButton aria-label="Close Dialog" variant="ghost" size="lg" className={styles.closeButton}>
                      <XIcon />
                    </IconButton>
                  </Dialog.CloseTrigger>
                </div>
              </div>
            </MotionDialogContent>
          )}
        </Portal>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

const AllScrollLock = memo(() => {
  /**
   * イベントリスナーの設定
   */
  useEffect(() => {
    // モバイルスクロール禁止処理
    document.addEventListener("touchmove", scrollNo, { passive: false });

    return () => {
      // イベントの設定解除
      document.removeEventListener("touchmove", scrollNo);
    };
  }, []);

  /**
   * モバイルスクロール禁止処理
   */
  const scrollNo = useCallback((e: TouchEvent) => {
    e.preventDefault();
  }, []);

  return <></>;
});
