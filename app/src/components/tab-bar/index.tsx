import { Link, useLocation } from "@tanstack/react-router";
import { House, type LucideIcon, MapPin, Store, User } from "lucide-react";
import { sva } from "../../../styled-system/css";

/** TabBar のタブを識別するキー */
export type TabKey = "home" | "map" | "shop" | "me";

interface TabDefinition {
    key: TabKey;
    // /map と /shop はまだルートが無いため、型付きの to ではなく文字列で持つ
    to: string;
    label: string;
    icon: LucideIcon;
}

// 表示順どおりに並べたタブの定義
const tabs: readonly TabDefinition[] = [
    { key: "home", to: "/", label: "ホーム", icon: House },
    { key: "map", to: "/map", label: "マップ", icon: MapPin },
    { key: "shop", to: "/shop", label: "おみせ", icon: Store },
    { key: "me", to: "/my-page", label: "あなた", icon: User },
];

/** pathname から選択中のタブを求める。どれにも当たらなければ null */
export const resolveActiveTab = (pathname: string): TabKey | null => {
    // ホームだけは前方一致させると全ページで選択されるため完全一致で判定する
    if (pathname === "/") {
        return "home";
    }
    const matched = tabs.find(
        (tab) =>
            tab.to !== "/" &&
            (pathname === tab.to || pathname.startsWith(`${tab.to}/`)),
    );
    return matched?.key ?? null;
};

const tabBarStyle = sva({
    slots: ["root", "item", "icon", "label"],
    base: {
        root: {
            // ページの上に浮かぶクロムなので、白い面 + 影で持ち上げる
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            // 下端から 52px 浮かせる。ホームインジケーターがある端末ではその上に余白を確保する
            bottom: "max(52px, calc(env(safe-area-inset-bottom) + 16px))",
            zIndex: "sticky",
            display: "flex",
            alignItems: "center",
            gap: "1",
            // 左右 16px ずつ空け、Layout の最大幅 (md) を超えない
            width: "calc(100% - 32px)",
            maxWidth: "calc({sizes.md} - 32px)",
            height: "64px",
            padding: "6px",
            bg: "bg.panel",
            borderRadius: "full",
            boxShadow: "chrome",
        },
        item: {
            flex: 1,
            minWidth: 0,
            height: "52px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
            borderRadius: "full",
            textDecoration: "none",
            color: "fg.muted",
            transition: "background 0.15s",
            // 選択中のタブだけ淡い面で囲み、文字色もブランド色にする
            "&[data-active]": {
                bg: "colorPalette.bg.subtle",
                color: "colorPalette.fg",
            },
        },
        icon: {
            width: "22px",
            height: "22px",
            flexShrink: 0,
        },
        label: {
            fontSize: "12px",
            lineHeight: "1.5",
            fontWeight: "medium",
            whiteSpace: "nowrap",
            "[data-active] > &": {
                fontWeight: "bold",
            },
        },
    },
});

export interface TabBarProps {
    /** 選択中のタブを明示する。省略時は現在の URL から判定する (Storybook など向け) */
    active?: TabKey | null;
}

/** 画面下部に浮かぶピル型のタブバー */
export const TabBar = ({ active }: TabBarProps) => {
    const location = useLocation();
    const style = tabBarStyle();
    // props で指定されていればそれを優先し、未指定なら URL から求める
    const activeTab =
        active === undefined ? resolveActiveTab(location.pathname) : active;

    return (
        <nav aria-label="メイン" className={style.root}>
            {tabs.map(({ key, to, label, icon: Icon }) => (
                <Link
                    key={key}
                    to={to}
                    className={style.item}
                    // 見た目は data-active で切り替える (aria-current は Link が URL から付ける)
                    data-active={activeTab === key ? "" : undefined}
                    // ホームを前方一致にすると全ページで選択扱いになるため完全一致にする
                    activeOptions={{
                        exact: key === "home",
                        includeSearch: false,
                    }}
                >
                    <Icon className={style.icon} aria-hidden />
                    <span className={style.label}>{label}</span>
                </Link>
            ))}
        </nav>
    );
};
