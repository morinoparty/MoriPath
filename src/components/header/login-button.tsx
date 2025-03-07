import { css } from "@/styled-system/css";
import { HStack } from "@/styled-system/jsx";
import { LogOutIcon, Settings, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { type ExtendedSession, auth, signIn, signOut } from "~/lib/auth";
import { Menu } from "../ui/menu";

export const LoginButton = async () => {
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
                {session ? <PlayerHead /> : <LoginForm />}
            </div>
        </div>
    );
};

const LoginForm = () => {
    return (
        <form
            action={async () => {
                "use server";
                await signIn("MineAuth");
            }}
        >
            <Button className={loginBoxStyle} type="submit">
                <span>ログイン</span>
            </Button>
        </form>
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
                        width: "48px",
                        height: "48px",
                        flexShrink: 0,
                        borderRadius: "lg",
                    })}
                    src={
                        sessionData.user?.image ??
                        "https://crafthead.net/avatar/Steave" + "/128.png"
                    }
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
                                <HStack
                                    gap="6"
                                    justify="space-between"
                                    flex="1"
                                >
                                    <HStack gap="2">
                                        <UserIcon />
                                        Profile
                                    </HStack>
                                </HStack>
                            </Link>
                        </Menu.Item>
                        <Menu.Item value="settings">
                            <Link href={"/my-page"}>
                                <HStack
                                    gap="6"
                                    justify="space-between"
                                    flex="1"
                                >
                                    <HStack gap="2">
                                        <Settings /> Settings
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
                                        <div>Sign out</div>
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

const loginBoxStyle = css({
    display: "flex",
    fontSize: "1rem",
    width: {
        base: "120px",
        md: "160px",
    },
    height: "48px",
    minWidth: "var(--spacings-radii-10, 40px)",
    padding: "var(--spacings-radii-0, 0px) var(--spacings-radii-4, 16px)",
    justifyContent: "center",
    alignItems: "center",
    gap: "var(--spacings-radii-2, 8px)",
    flexShrink: 0,
    borderRadius: "lg",
});
