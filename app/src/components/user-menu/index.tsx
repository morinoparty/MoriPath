import { Menu } from "@ark-ui/react/menu";
import { Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { LogOutIcon, Settings, UserIcon } from "lucide-react";
import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";
import { css, sva } from "../../../styled-system/css";
import { getAuth } from "../../lib/auth";
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

// Ark UI の Menu はヘッドレスなので、パネルと項目の見た目をここで持つ
const userMenuStyle = sva({
    slots: ["content", "groupLabel", "separator", "item", "itemRow"],
    base: {
        content: {
            minWidth: "160px",
            padding: "1",
            bgColor: "bg.panel",
            color: "fg",
            border: "1px solid",
            borderColor: "border",
            borderRadius: "md",
            boxShadow: "overlay",
            zIndex: "dropdown",
            outline: "none",
        },
        groupLabel: {
            padding: "6px 8px",
            fontSize: "sm",
            fontWeight: "bold",
            color: "fg.muted",
        },
        separator: {
            marginY: "1",
            border: "none",
            borderTop: "1px solid",
            borderColor: "border.muted",
        },
        item: {
            display: "block",
            width: "100%",
            padding: "6px 8px",
            fontSize: "sm",
            borderRadius: "sm",
            cursor: "pointer",
            _highlighted: {
                bgColor: "colorPalette.surface.hover",
            },
        },
        itemRow: {
            display: "flex",
            alignItems: "center",
            gap: "2",
        },
    },
});

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
    const style = userMenuStyle();

    return (
        <Menu.Positioner>
            <Menu.Content className={style.content}>
                <Menu.ItemGroup>
                    <Menu.ItemGroupLabel className={style.groupLabel}>
                        {session?.user?.name}
                    </Menu.ItemGroupLabel>
                    <Menu.Separator className={style.separator} />
                    {children}
                </Menu.ItemGroup>
            </Menu.Content>
        </Menu.Positioner>
    );
};

const ProfileItem = () => {
    const style = userMenuStyle();
    return (
        <Menu.Item value="profile" className={style.item} asChild>
            <Link to="/my-page">
                <span className={style.itemRow}>
                    <UserIcon size={16} />
                    <span>プロフィール</span>
                </span>
            </Link>
        </Menu.Item>
    );
};

const SettingsItem = () => {
    const style = userMenuStyle();
    return (
        <Menu.Item value="settings" className={style.item} asChild>
            <Link to="/my-page">
                <span className={style.itemRow}>
                    <Settings size={16} />
                    <span>設定</span>
                </span>
            </Link>
        </Menu.Item>
    );
};

// サーバー関数としてサインアウトを実行
// biome-ignore lint/suspicious/noExplicitAny: request is not typed
const signOutAction = createServerFn().handler(async ({ request }: any) => {
    const auth = await getAuth();
    await auth.api.signOut({
        headers: request.headers,
    });
});

const LogoutItem = () => {
    const style = userMenuStyle();
    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        await signOutAction();
        window.location.reload();
    };

    return (
        <Menu.Item value="logout" className={style.item} asChild>
            <button
                type="button"
                onClick={handleLogout}
                className={css({
                    background: "none",
                    border: "none",
                    textAlign: "left",
                })}
            >
                <span className={style.itemRow}>
                    <LogOutIcon size={16} />
                    <span>ログアウト</span>
                </span>
            </button>
        </Menu.Item>
    );
};

const Separator = () => {
    const style = userMenuStyle();
    return <Menu.Separator className={style.separator} />;
};

export const UserMenu = {
    Root,
    Trigger,
    Content,
    ProfileItem,
    SettingsItem,
    LogoutItem,
    Separator,
};
