import { HStack, Menu } from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { LogOutIcon, Settings, UserIcon } from "lucide-react";
import { sva } from "../../../styled-system/css";
import { auth } from "../../lib/auth";
import type { SessionData } from "../../lib/server-functions";

interface LoginStatusProps {
    session: SessionData;
}

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

export const LoginStatus = ({ session }: LoginStatusProps) => {
    const style = loginStatusStyle();

    return (
        <div className={style.root}>
            {session?.user ? <PlayerHead session={session} /> : null}
        </div>
    );
};

const PlayerHead = ({ session }: { session: SessionData }) => {
    const style = loginStatusStyle();

    return (
        <Menu.Root>
            <Menu.Trigger>
                <img
                    className={style.avatar}
                    src={
                        session?.user?.image ??
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
                            <div>{session?.user?.name}</div>
                        </Menu.ItemGroupLabel>
                        <Menu.Separator />
                        <Menu.Item value="profile">
                            <Link to="/my-page">
                                <HStack gap="2">
                                    <UserIcon />
                                    プロフィール
                                </HStack>
                            </Link>
                        </Menu.Item>
                        <Menu.Item value="settings">
                            <Link to="/my-page">
                                <HStack gap="2">
                                    <Settings /> 設定
                                </HStack>
                            </Link>
                        </Menu.Item>
                        <Menu.Separator />
                        <Menu.Item value="logout">
                            <LogoutForm />
                        </Menu.Item>
                    </Menu.ItemGroup>
                </Menu.Content>
            </Menu.Positioner>
        </Menu.Root>
    );
};

// サーバー関数としてサインアウトを実行
// サインアウト対象のセッションを特定するために request.headers を渡す
const signOutAction = createServerFn().handler(async ({ request }) => {
    await auth.api.signOut({
        headers: request.headers,
    });
});

const LogoutForm = () => {
    return (
        <form
            action={async () => {
                await signOutAction();
                window.location.reload();
            }}
        >
            <button type="submit">
                <HStack gap="2">
                    <LogOutIcon />
                    <div>ログアウト</div>
                </HStack>
            </button>
        </form>
    );
};
