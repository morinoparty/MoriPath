import nullAvatar from "@/public/null.png";
import { getPlayerData, uuidToName } from "@/src/utils/player-helpers";
import { randomPhrase } from "@/src/utils/random-phrase";
import { css } from "@/styled-system/css";
import { XIcon } from "lucide-react";
import Image from "next/image";
import { IconButton } from "~/components/ui/icon-button";
import { hashToPastelColor } from "~/utils/color";
import { generateHash } from "~/utils/hash";
import { Dialog } from "../../ui/dialog";

const headerHeight = 128;
const iconSize = 72;

export const PlayerDrawer: React.FC<{
    children: React.ReactNode;
    uuid: string;
}> = async ({ children, uuid }) => {
    return (
        <Dialog.Root>
            <Dialog.Trigger
                className={css({
                    flexShrink: 0,
                })}
            >
                {children}
            </Dialog.Trigger>
            <Dialog.Positioner>
                <Dialog.Content
                    className={css({
                        width: {
                            base: "100vw",
                            md: "md",
                        },
                        padding: "0 24px",
                        margin: "0 auto",
                        minH: "50vh",
                        maxH: "70vh",
                        borderRadius: "32px 32px 0 0",
                        // border: "1px solid var(--colors-border-default)",
                        border: "none",
                        position: "absolute",
                        bottom: "0",
                        display: "flex",
                        flexDirection: "column",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        whiteSpace: "pre-wrap",
                        overflowY: "auto",
                        flex: "1",
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": {
                            display: "none",
                        },
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            bgColor: "var(--random-background-color)",
                            top: "0",
                            left: "0",
                            right: "0",
                            height: `${headerHeight}px`,
                            width: "100%",
                            borderRadius: "32px 32px 0 0",
                            zIndex: "1",
                        },
                    })}
                    style={
                        {
                            "--random-background-color": hashToPastelColor(generateHash(uuid), false),
                        } as React.CSSProperties
                    }
                >
                    <div
                        className={css({
                            width: "100%",
                            maxWidth: "md",
                            position: "relative",
                            paddingTop: "2",
                            zIndex: "2",
                        })}
                    >
                        <div
                            className={css({
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                alignSelf: "stretch",
                                paddingTop: "calc(var(--header-height) - 8px - (var(--icon-size)/2))",
                            })}
                            style={
                                {
                                    "--header-height": `${headerHeight}px`,
                                    "--icon-size": `${iconSize + 16}px`,
                                } as React.CSSProperties
                            }
                        >
                            <div
                                className={css({
                                    borderRadius: "2xl",
                                    width: "var(--icon-size)",
                                    height: "var(--icon-size)",
                                    bgColor: "white",
                                    zIndex: "2",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                })}
                            >
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
                            <div
                                className={css({
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "4px",
                                })}
                            >
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
                                        {await uuidToName(uuid)}
                                    </Dialog.Title>
                                    <div
                                        className={css({
                                            fontSize: "xs",
                                        })}
                                    >
                                        {randomPhrase("first", uuid) + randomPhrase("last", uuid)}
                                    </div>
                                </div>
                                <Dialog.Description
                                    className={css({
                                        fontSize: "xs",
                                    })}
                                >
                                    <div>{(await getPlayerData(uuid)).server}</div>
                                    {/*{uuid}*/}
                                </Dialog.Description>
                            </div>
                        </div>
                    </div>
                    {/*<div*/}
                    {/*    className={css({*/}
                    {/*        width: "100%",*/}
                    {/*        maxWidth: "md",*/}
                    {/*    })}*/}
                    {/*>*/}
                    {/*    {fakerJA.lorem.paragraph(40)}*/}
                    {/*</div>*/}
                    <Dialog.CloseTrigger asChild position="absolute" top="4" right="4" zIndex="2">
                        <IconButton aria-label="Close Dialog" variant="ghost" size="lg">
                            <XIcon />
                        </IconButton>
                    </Dialog.CloseTrigger>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
