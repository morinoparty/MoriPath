"use client";

import nullAvatar from "@/public/null.png";
import { css } from "@/styled-system/css";
import { faker } from "@faker-js/faker";
import { type PanInfo, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useEffect, useRef, useState } from "react";
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
  const constraintsRef = useRef(null);

  const [dragSum, setDragSum] = useState(0);

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragSum(dragSum + info.offset.y);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.point.y > 350) {
      setIsOpen(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(details) => setIsOpen(details.open)}>
      <Dialog.Trigger
        className={css({
          flexShrink: 0,
        })}
        onClick={() => {
          setIsOpen(true);
          setDragSum(0);
        }}
      >
        {children}
      </Dialog.Trigger>

      {isOpen && (
        <Dialog.Positioner>
          <AllScrollLock />
          <Dialog.Content
            className={css(dialogContentStyles)}
            style={
              {
                "--background-color": backgroundColor,
                "--drawer-border-radius": "32px 32px 0 0",
                "--drawer-heading-height": `${headerHeight}px`,
                "--height": `calc(70vh - ${dragSum * 0.1}px)`,
              } as React.CSSProperties
            }
          >
            <motion.div
              className={css({ height: "100%", display: "flex", flexDirection: "column", cursor: "grab" })}
              drag="y"
              dragConstraints={{ bottom: 300 }}
              dragElastic={0.1}
              onDragEnd={handleDragEnd}
              onDrag={handleDrag}
            >
              <div className={css(handleStyles)} style={{ "--handle-height": "8px" } as React.CSSProperties} />
              <div className={css(contentContainerStyles)}>
                <div
                  className={css({
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    alignSelf: "stretch",
                    paddingTop: "calc(var(--header-height) - 8px - (var(--handle-height) * 2) - (var(--icon-size)/2))",
                  })}
                  style={
                    {
                      "--header-height": `${headerHeight}px`,
                      "--icon-size": `${iconSize + 16}px`,
                      "--handle-height": "8px",
                    } as React.CSSProperties
                  }
                >
                  <div className={css(avatarContainerStyles)}>
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
                  <div className={css(playerInfoStyles)}>
                    <div
                      className={css({
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "16px",
                      })}
                    >
                      <Dialog.Title
                        className={css({
                          fontSize: "2xl",
                          fontWeight: "bold",
                        })}
                      >
                        {playerName}
                      </Dialog.Title>
                      <div
                        className={css({
                          fontSize: "xs",
                        })}
                      >
                        {randomText}
                      </div>
                    </div>
                    <Dialog.Description
                      className={css({
                        fontSize: "xs",
                      })}
                    >
                      <div>{playerServer}</div>
                      {isOpen.toString()}
                      {Array.from({ length: 14 }).map((_, i) => (
                        <div key={i}>{faker.lorem.paragraph()}</div>
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
              <IconButton
                aria-label="Close Dialog"
                variant="ghost"
                size="lg"
                position="absolute"
                top="4"
                right="4"
                zIndex="2"
              >
                <XIcon />
              </IconButton>
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      )}
    </Dialog.Root>
  );
};

const dialogContentStyles = {
  width: {
    base: "100vw",
    md: "md",
  },
  padding: "0 24px",
  margin: "0 auto",
  borderRadius: "var(--drawer-border-radius)",
  position: "absolute",
  bottom: "0",
  height: "var(--height)",
  display: "flex",
  flexDirection: "column",
  wordWrap: "break-word",
  overflowWrap: "break-word",
  whiteSpace: "pre-wrap",
  overflowY: "auto",
  flex: "1",
  scrollbarWidth: "none",
  bgColor: "white",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    bgColor: "var(--background-color)",
    top: "0",
    left: "0",
    right: "0",
    height: "var(--drawer-heading-height)",
    width: "100%",
    borderRadius: "var(--drawer-border-radius)",
    zIndex: "2",
  },
};

const handleStyles = {
  margin: "0 auto",
  width: "80px",
  marginTop: "8px",
  height: "4px",
  borderRadius: "full",
  zIndex: "3",
  bg: "gray",
  flexShrink: 0,
};

const contentContainerStyles = {
  width: "100%",
  maxWidth: "md",
  position: "relative",
  paddingTop: "2",
  zIndex: "4",
};

const avatarContainerStyles = {
  borderRadius: "2xl",
  width: "var(--icon-size)",
  height: "var(--icon-size)",
  bgColor: "white",
  zIndex: "4",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const playerInfoStyles = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
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
