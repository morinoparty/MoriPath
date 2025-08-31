import { HStack, Menu } from "@chakra-ui/react";
import { LogOutIcon, Settings, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { sva } from "@/styled-system/css";
import { auth, type ExtendedSession, signOut } from "~/lib/auth";

const loginStatusStyle = sva({
    slots: ["root", "avatar", "menu"],
    base: {
        root: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "44px",
            height: "44px",
            gap: "var(--spacings-radii-2, 8px)",
        },
        avatar: {
            width: "44px",
            height: "44px",
            borderRadius: "md",
        },
        menu: {
            width: "160px",
        },
    },
});

export const LoginStatus = async () => {
    const session = await auth();
    const style = loginStatusStyle();

    return <div className={style.root}>{session ? <PlayerHead /> : null}</div>;
};

const PlayerHead = async () => {
    const session = await auth();
    const sessionData = session as ExtendedSession;
    const style = loginStatusStyle();

    return (
        <Menu.Root>
            <Menu.Trigger>
                <Image
                    className={style.avatar}
                    src={
                        sessionData.user?.image ??
                        "https://crafthead.net/avatar/Steave" + "/128.png"
                    }
                    width="44"
                    height="44"
                    alt="logo"
                />
            </Menu.Trigger>
            <Menu.Positioner>
                <Menu.Content className={style.menu}>
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
                                        プロフィール
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
