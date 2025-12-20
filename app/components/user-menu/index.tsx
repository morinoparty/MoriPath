import { HStack, Menu } from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { LogOutIcon, Settings, UserIcon } from "lucide-react";
import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";
import { css } from "../../../styled-system/css";
import { auth } from "../../lib/auth";
import type { SessionData } from "../../lib/server-functions";

interface UserMenuProps {
    session: SessionData;
}

interface UserMenuContextValue {
    session: SessionData;
}

const UserMenuContext = createContext<UserMenuContextValue | null>(null);

const useUserMenuContext = () => {
    const context = useContext(UserMenuContext);
    if (!context) {
        throw new Error(
            "UserMenu components must be used within UserMenu.Root",
        );
    }
    return context;
};

const Root = ({ session, children }: PropsWithChildren<UserMenuProps>) => {
    if (!session?.user) {
        return null;
    }

    return (
        <UserMenuContext.Provider value={{ session }}>
            <Menu.Root>{children}</Menu.Root>
        </UserMenuContext.Provider>
    );
};

interface TriggerProps {
    children: React.ReactNode;
}

const Trigger = ({ children }: TriggerProps) => {
    return <Menu.Trigger>{children}</Menu.Trigger>;
};

interface ContentProps {
    children?: React.ReactNode;
}

const Content = ({ children }: ContentProps) => {
    const { session } = useUserMenuContext();

    return (
        <Menu.Positioner>
            <Menu.Content minW="200px">
                <Menu.ItemGroup>
                    <Menu.ItemGroupLabel>{session?.user?.name}</Menu.ItemGroupLabel>
                    <Menu.Separator />
                    {children}
                </Menu.ItemGroup>
            </Menu.Content>
        </Menu.Positioner>
    );
};

const ProfileItem = () => {
    return (
        <Menu.Item value="profile" asChild>
            <Link to="/my-page">
                <HStack gap="2">
                    <UserIcon size={16} />
                    <span>プロフィール</span>
                </HStack>
            </Link>
        </Menu.Item>
    );
};

const SettingsItem = () => {
    return (
        <Menu.Item value="settings" asChild>
            <Link to="/my-page">
                <HStack gap="2">
                    <Settings size={16} />
                    <span>設定</span>
                </HStack>
            </Link>
        </Menu.Item>
    );
};

// サーバー関数としてサインアウトを実行
const signOutAction = createServerFn().handler(async ({ request }) => {
    await auth.api.signOut({
        headers: request.headers,
    });
});

const LogoutItem = () => {
    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        await signOutAction();
        window.location.reload();
    };

    return (
        <Menu.Item value="logout" asChild>
            <button
                type="button"
                onClick={handleLogout}
                className={css({
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                })}
            >
                <HStack gap="2">
                    <LogOutIcon size={16} />
                    <span>ログアウト</span>
                </HStack>
            </button>
        </Menu.Item>
    );
};

export const UserMenu = {
    Root,
    Trigger,
    Content,
    ProfileItem,
    SettingsItem,
    LogoutItem,
    Separator: Menu.Separator,
};
