import { css } from "@/styled-system/css";
import { HStack } from "@/styled-system/jsx";
import { LogOutIcon, Settings, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type ExtendedSession, auth, signOut } from "~/lib/auth";
import { Menu } from "../ui/menu";

export const Status = async () => {
    const session = await auth();

    return (
        <div
            className={css({
                height: "64px",
            })}
        >
            <div
                className={css({
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                    gap: "var(--spacings-radii-2, 8px)",
                })}
            >
                {session ? <PlayerHead /> : null}
            </div>
        </div>
    );
};

const PlayerHead = async () => {
    const session = await auth();
    const sessionData = session as ExtendedSession;

    return (
        <Menu.Root>
            <Menu.Trigger>
                <Image
                    className={css({
                        width: "var(--sizes-header-height)",
                        height: "var(--sizes-header-height)",
                        borderRadius: "lg",
                    })}
                    src={sessionData.user?.image ?? "https://crafthead.net/avatar/Steave" + "/128.png"}
                    width="50"
                    height="50"
                    alt="logo"
                />
            </Menu.Trigger>
            <Menu.Positioner>
                <Menu.Content className={css({ width: "160px" })}>
                    <Menu.ItemGroup>
                        <Menu.ItemGroupLabel>
                            <div>{sessionData.user?.name}</div>
                        </Menu.ItemGroupLabel>
                        <Menu.Separator />
                        {/*/my-pageに異動*/}
                        <Menu.Item value="profile">
                            <Link href={"/my-page"}>
                                <HStack gap="6" justify="space-between" flex="1">
                                    <HStack gap="2">
                                        <UserIcon />
                                        プロフィール
                                    </HStack>
                                </HStack>
                            </Link>
                        </Menu.Item>
                        <Menu.Item value="settings">
                            <Link href={"/my-page"}>
                                <HStack gap="6" justify="space-between" flex="1">
                                    <HStack gap="2">
                                        <Settings /> 設定
                                    </HStack>
                                </HStack>
                            </Link>
                        </Menu.Item>

                        <Menu.Separator />
                        <Menu.Item value="logout">
                            <form
                                action={async (_) => {
                                    "use server";
                                    await signOut();
                                }}
                            >
                                <button type="submit">
                                    <HStack gap="2">
                                        <LogOutIcon />
                                        <div>ログアウト</div>
                                    </HStack>
                                </button>
                            </form>
                        </Menu.Item>
                    </Menu.ItemGroup>
                </Menu.Content>
            </Menu.Positioner>
        </Menu.Root>
    );
};
