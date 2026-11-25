import { Menu } from "@ark-ui/react/menu";
import { Bell, Check, ChevronDown } from "lucide-react";
import type { PropsWithChildren } from "react";
import { sva } from "../../../styled-system/css";
import type { SessionData } from "../../lib/server-functions";
import { LoginStatus } from "../login-status";
import { type Palette, usePalette } from "../ui/palette";

const homeHeaderStyle = sva({
    slots: [
        "root",
        "switcher",
        "logo",
        "chevron",
        "menuContent",
        "menuItem",
        "menuCheck",
        "actions",
        "iconButton",
        "avatarFrame",
        "avatar",
    ],
    base: {
        root: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingX: "6",
            paddingY: "2",
        },
        // ロゴ + 下向き矢印のピル。ページの地より一段明るい面に載せる
        switcher: {
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 10px 6px 8px",
            bg: "colorPalette.surface.subtle",
            color: "colorPalette.fg",
            borderRadius: "full",
            cursor: "pointer",
            transition: "background 0.15s",
            _hover: {
                bg: "colorPalette.surface.hover",
            },
        },
        logo: {
            width: "24px",
            height: "28px",
            objectFit: "contain",
        },
        chevron: {
            width: "16px",
            height: "16px",
        },
        // ポップオーバーは浮かせる要素なので白い面 + 影にする
        menuContent: {
            minWidth: "160px",
            padding: "1",
            bg: "bg.panel",
            color: "colorPalette.fg",
            borderRadius: "popover",
            boxShadow: "floating",
            zIndex: "dropdown",
            outline: "none",
        },
        menuItem: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "2",
            padding: "6px 8px",
            fontSize: "sm",
            borderRadius: "item",
            cursor: "pointer",
            _highlighted: {
                bg: "colorPalette.surface.hover",
            },
        },
        menuCheck: {
            width: "16px",
            height: "16px",
        },
        actions: {
            display: "flex",
            alignItems: "center",
            gap: "2",
        },
        iconButton: {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "full",
            bg: "transparent",
            color: "colorPalette.fg",
            cursor: "pointer",
            transition: "background 0.15s",
            _hover: {
                bg: "colorPalette.surface.hover",
            },
            "& svg": {
                width: "20px",
                height: "20px",
            },
        },
        // LoginStatus の既定 44px 枠をヘッダー用の 40px に合わせる
        avatarFrame: {
            width: "40px",
            height: "40px",
        },
        // 顔画像の縁取り。カードの枠線ではなく、地から顔を切り離すためのリング
        avatar: {
            width: "40px",
            height: "40px",
            // preset の radius が md なので control だと 6px で角ばる。40px の顔には 12px を当てる
            borderRadius: "xl",
            border: "2px solid",
            borderColor: "bg.panel",
            imageRendering: "pixelated",
            objectFit: "cover",
        },
    },
});

// 切り替え候補のパレット。ラベルは短く、メニュー内でのみ表示する
const paletteOptions: readonly { value: Palette; label: string }[] = [
    { value: "mori", label: "もり" },
    { value: "umi", label: "うみ" },
];

const Root = ({ children }: PropsWithChildren) => {
    const style = homeHeaderStyle();
    return <header className={style.root}>{children}</header>;
};

/** ロゴのピル。押すとカラーパレット (もり / うみ) を選ぶメニューを開く */
const ServerSwitcher = () => {
    const style = homeHeaderStyle();
    const { palette, setPalette } = usePalette();

    return (
        <Menu.Root
            onSelect={({ value }) => {
                // メニューの値はパレット名なので、候補にあるものだけ反映する
                const option = paletteOptions.find((o) => o.value === value);
                if (option) {
                    setPalette(option.value);
                }
            }}
        >
            <Menu.Trigger
                className={style.switcher}
                aria-label="テーマを切り替え"
            >
                <img
                    className={style.logo}
                    src="/moripa.svg"
                    alt=""
                    width={24}
                    height={28}
                />
                <ChevronDown className={style.chevron} aria-hidden />
            </Menu.Trigger>
            <Menu.Positioner>
                <Menu.Content className={style.menuContent}>
                    {paletteOptions.map((option) => (
                        <Menu.Item
                            key={option.value}
                            value={option.value}
                            className={style.menuItem}
                        >
                            {option.label}
                            {palette === option.value && (
                                <Check
                                    className={style.menuCheck}
                                    aria-hidden
                                />
                            )}
                        </Menu.Item>
                    ))}
                </Menu.Content>
            </Menu.Positioner>
        </Menu.Root>
    );
};

const Actions = ({ children }: PropsWithChildren) => {
    const style = homeHeaderStyle();
    return <div className={style.actions}>{children}</div>;
};

/** お知らせボタン。お知らせ機能ができるまでは見た目だけ */
const NotificationButton = () => {
    const style = homeHeaderStyle();
    return (
        <button
            type="button"
            className={style.iconButton}
            aria-label="お知らせ"
        >
            <Bell aria-hidden />
        </button>
    );
};

interface AvatarProps {
    session: SessionData;
}

/** 自分の顔アイコン。押すとプロフィール / 設定 / ログアウトのメニューを開く */
const Avatar = ({ session }: AvatarProps) => {
    const style = homeHeaderStyle();
    return (
        <LoginStatus.Root session={session} className={style.avatarFrame}>
            <LoginStatus.Menu.Root session={session}>
                <LoginStatus.Menu.Trigger>
                    <LoginStatus.Avatar className={style.avatar} />
                </LoginStatus.Menu.Trigger>
                <LoginStatus.Menu.Content>
                    <LoginStatus.Menu.ProfileItem />
                    <LoginStatus.Menu.SettingsItem />
                    <LoginStatus.Menu.Separator />
                    <LoginStatus.Menu.LogoutItem />
                </LoginStatus.Menu.Content>
            </LoginStatus.Menu.Root>
        </LoginStatus.Root>
    );
};

interface BuiltedProps {
    session: SessionData;
}

/** トップレベルのページ (ホームなど) で使う、組み立て済みのヘッダー */
const Builted = ({ session }: BuiltedProps) => (
    <Root>
        <ServerSwitcher />
        <Actions>
            <NotificationButton />
            <Avatar session={session} />
        </Actions>
    </Root>
);

export const HomeHeader = {
    Root,
    ServerSwitcher,
    Actions,
    NotificationButton,
    Avatar,
    Builted,
};
