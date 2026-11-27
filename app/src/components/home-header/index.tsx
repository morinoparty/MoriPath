import { Menu } from "@morinoparty/chlorophyll-react/components";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronDown } from "lucide-react";
import type { PropsWithChildren } from "react";
import { sva } from "../../../styled-system/css";
import type { SessionData } from "../../lib/server-functions";
import { LoginStatus } from "../login-status";

const homeHeaderStyle = sva({
    slots: [
        "root",
        "switcher",
        "partyIcon",
        "chevron",
        "indicator",
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
            // 左右は下の TabBar と地図の操作ボタンと同じ 16px にそろえる
            paddingX: "4",
            paddingY: "2",
        },
        // いまのパーティ (アイコン + 名前 + 下向き矢印) のピル。ページの地より一段明るい面に載せる
        switcher: {
            gap: "2",
            height: "40px",
            paddingLeft: "2.5",
            paddingRight: "3",
            bg: "colorPalette.surface.subtle",
            borderRadius: "full",
            fontSize: "sm",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            transition: "background 0.15s",
            _hover: {
                bg: "colorPalette.surface.hover",
            },
        },
        // パーティのアイコン。トリガーと項目の先頭で同じ大きさにそろえる
        partyIcon: {
            flexShrink: "0",
            width: "20px",
            height: "20px",
            objectFit: "contain",
            // 選べない項目では、灰色になるラベルに合わせてアイコンも薄くする
            "[data-disabled] > &": {
                opacity: "0.5",
            },
        },
        chevron: {
            width: "16px",
            height: "16px",
            transition: "transform 0.15s",
            // 開いているあいだは上向きにする
            "[data-state=open] > &": {
                transform: "rotate(180deg)",
            },
        },
        // 項目の先頭はパーティのアイコンにするので、選択中の印は行末に寄せる
        indicator: {
            marginLeft: "auto",
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

type PartyId = "mori" | "tsuri";

interface PartyOption {
    value: PartyId;
    label: string;
    /** app/public に置いたアイコン画像のパス */
    icon: string;
    /** そのパーティのトップページ */
    href: "/" | "/fishing";
    /** まだ切り替えられないパーティ */
    disabled?: boolean;
}

// 切り替え候補のパーティ。つりのパーティはまだ移れないので選べないようにしておく
const partyOptions: readonly PartyOption[] = [
    { value: "mori", label: "もりのパーティ", icon: "/moripa.svg", href: "/" },
    {
        value: "tsuri",
        label: "つりのパーティ",
        // https://fishing.plugin.morino.party/ の favicon
        icon: "/icons/tsuri-no-party.png",
        href: "/fishing",
        // ページは /fishing に用意してあるが、中身ができるまでメニューからは移れないようにしておく
        disabled: true,
    },
];

/** URL からいまのパーティを決める。/fishing 配下ならつりのパーティ、それ以外はもりのパーティ */
export const resolveParty = (pathname: string): PartyId =>
    pathname === "/fishing" || pathname.startsWith("/fishing/")
        ? "tsuri"
        : "mori";

const Root = ({ children }: PropsWithChildren) => {
    const style = homeHeaderStyle();
    return <header className={style.root}>{children}</header>;
};

interface ServerSwitcherProps {
    /** Storybook で開いた状態を見せるため */
    defaultOpen?: boolean;
}

/** いまのパーティのピル。押すとパーティ (もりのパーティ / つりのパーティ) を選ぶメニューを開く */
const ServerSwitcher = ({ defaultOpen }: ServerSwitcherProps) => {
    const style = homeHeaderStyle();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const currentParty =
        partyOptions.find(
            (option) => option.value === resolveParty(pathname),
        ) ?? partyOptions[0];

    return (
        <Menu.Root
            defaultOpen={defaultOpen}
            positioning={{ placement: "bottom-start", gutter: 8 }}
        >
            {/* 名前はピルに見えている「もりのパーティ」から付く。メニューも aria-labelledby でこの名前を引き継ぐ */}
            <Menu.Trigger className={style.switcher}>
                <img
                    className={style.partyIcon}
                    src={currentParty.icon}
                    alt=""
                    width={20}
                    height={20}
                />
                {currentParty.label}
                <ChevronDown className={style.chevron} aria-hidden />
            </Menu.Trigger>
            <Menu.Positioner>
                <Menu.Content>
                    {/* 選べるのは 1 つだけなので、選択中が aria-checked で伝わる RadioItem にする */}
                    <Menu.RadioItemGroup
                        value={currentParty.value}
                        // 選んだパーティのトップページへ移る (選べないパーティはここに来ない)
                        onValueChange={({ value }) => {
                            const next = partyOptions.find(
                                (option) => option.value === value,
                            );
                            if (next && next.value !== currentParty.value) {
                                void navigate({ to: next.href });
                            }
                        }}
                    >
                        {partyOptions.map((option) => (
                            <Menu.RadioItem
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                <img
                                    className={style.partyIcon}
                                    src={option.icon}
                                    alt=""
                                    width={20}
                                    height={20}
                                />
                                {option.label}
                                <Menu.ItemIndicator
                                    className={style.indicator}
                                />
                            </Menu.RadioItem>
                        ))}
                    </Menu.RadioItemGroup>
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
    /** Storybook で開いた状態を見せるため */
    defaultOpen?: boolean;
}

/** 自分の顔アイコン。押すとプロフィール / 設定 / ログアウトのメニューを開く */
const Avatar = ({ session, defaultOpen }: AvatarProps) => {
    const style = homeHeaderStyle();
    return (
        <LoginStatus.Root session={session} className={style.avatarFrame}>
            <LoginStatus.Menu.Root session={session} defaultOpen={defaultOpen}>
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
