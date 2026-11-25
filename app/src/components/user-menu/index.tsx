import { Menu } from "@morinoparty/chlorophyll-react/components";
import { Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { LogOutIcon, Settings, UserIcon } from "lucide-react";
import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";
import { getAuth } from "../../lib/auth";
import type { SessionData } from "../../lib/server-functions";

export interface UserMenuProps {
    session: SessionData;
    /** Storybook で開いた状態を見せるため */
    defaultOpen?: boolean;
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

// 見た目は Chlorophyll の Menu レシピに任せ、ここでは項目の中身と動作だけを持つ
const Root = ({
    session,
    defaultOpen,
    children,
}: PropsWithChildren<UserMenuProps>) => {
    if (!session?.user) {
        return null;
    }

    return (
        <UserMenuContext.Provider value={{ session }}>
            {/* 画面の右上の顔アイコンから開くので、右端をそろえて画面外にはみ出さないようにする */}
            <Menu.Root
                defaultOpen={defaultOpen}
                positioning={{ placement: "bottom-end", gutter: 8 }}
            >
                {children}
            </Menu.Root>
        </UserMenuContext.Provider>
    );
};

export interface TriggerProps {
    children: React.ReactNode;
}

const Trigger = ({ children }: TriggerProps) => {
    return <Menu.Trigger>{children}</Menu.Trigger>;
};

export interface ContentProps {
    children?: React.ReactNode;
}

const Content = ({ children }: ContentProps) => {
    const { session } = useUserMenuContext();

    return (
        <Menu.Positioner>
            <Menu.Content>
                {/* 誰としてログインしているかを見出しで示す */}
                <Menu.ItemGroup>
                    <Menu.ItemGroupLabel>
                        {session?.user?.name}
                    </Menu.ItemGroupLabel>
                    {children}
                </Menu.ItemGroup>
            </Menu.Content>
        </Menu.Positioner>
    );
};

const ProfileItem = () => {
    return (
        // 遷移はリンクに任せるため、項目そのものを Link として描画する
        <Menu.Item value="profile" asChild>
            <Link to="/my-page">
                <UserIcon size={16} aria-hidden />
                プロフィール
            </Link>
        </Menu.Item>
    );
};

const SettingsItem = () => {
    return (
        <Menu.Item value="settings" asChild>
            <Link to="/my-page">
                <Settings size={16} aria-hidden />
                設定
            </Link>
        </Menu.Item>
    );
};

// oxlint-disable-next-line typescript/no-explicit-any -- request is not typed
const signOutAction = createServerFn().handler(async ({ request }: any) => {
    const auth = await getAuth();
    await auth.api.signOut({
        headers: request.headers,
    });
});

const LogoutItem = () => {
    // サインアウトしたら、ログイン前の状態で描き直すために再読み込みする
    const handleLogout = async () => {
        await signOutAction();
        window.location.reload();
    };

    return (
        // 破壊的な操作なので Chlorophyll の danger 表示にする。クリックでも Enter でも onSelect が呼ばれる
        <Menu.Item value="logout" variant="danger" onSelect={handleLogout}>
            <LogOutIcon size={16} aria-hidden />
            ログアウト
        </Menu.Item>
    );
};

const Separator = () => {
    return <Menu.Separator />;
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
