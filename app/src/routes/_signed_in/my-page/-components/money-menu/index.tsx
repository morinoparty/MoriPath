import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon, Shield } from "lucide-react";
import { useId } from "react";
import { cx, sva } from "../../../../../../styled-system/css";

/** メニューの 1 行。遷移先のある項目だけを並べる */
export interface MoneyMenuItem {
    // まだ型付きルートに無いページも渡せるよう文字列で持つ
    to: string;
    label: string;
    icon: LucideIcon;
}

/** 既定の項目。送金や履歴はページができたら追加する */
export const defaultMoneyMenuItems: readonly MoneyMenuItem[] = [
    { to: "/balance-claim", label: "保護ブロックを買う", icon: Shield },
];

const moneyMenuStyle = sva({
    slots: ["root", "title", "list", "item", "icon", "label", "chevron"],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "3",
        },
        title: {
            fontSize: "18px",
            fontWeight: "bold",
            lineHeight: "1.5",
            color: "colorPalette.fg",
        },
        list: {
            // 枠線・影・区切り線を持たない面のカード
            display: "flex",
            flexDirection: "column",
            paddingY: "1",
            bg: "colorPalette.surface.subtle",
            borderRadius: "panel",
            listStyle: "none",
            margin: "0",
            overflow: "hidden",
        },
        item: {
            display: "flex",
            alignItems: "center",
            gap: "3",
            paddingX: "4",
            paddingY: "14px",
            color: "colorPalette.fg",
            textDecoration: "none",
            transition: "background 0.15s",
            _hover: {
                bg: "colorPalette.surface.hover",
            },
            _active: {
                bg: "colorPalette.surface.active",
            },
        },
        icon: {
            width: "20px",
            height: "20px",
            flexShrink: 0,
        },
        label: {
            flex: 1,
            minWidth: 0,
            fontSize: "15px",
            fontWeight: "medium",
            lineHeight: "1.5",
        },
        chevron: {
            width: "20px",
            height: "20px",
            flexShrink: 0,
            color: "colorPalette.fg.muted",
        },
    },
});

export interface MoneyMenuProps {
    items?: readonly MoneyMenuItem[];
    className?: string;
}

/** 「おかね」のメニュー。項目が無ければ何も出さない */
export const MoneyMenu = ({
    items = defaultMoneyMenuItems,
    className,
}: MoneyMenuProps) => {
    const style = moneyMenuStyle();
    // 見出しとセクションを結び付ける id (同じページに複数置いても重複しない)
    const titleId = useId();
    if (items.length === 0) {
        return null;
    }
    return (
        <section
            aria-labelledby={titleId}
            className={cx(style.root, className)}
        >
            <h2 id={titleId} className={style.title}>
                おかね
            </h2>
            <ul className={style.list}>
                {items.map(({ to, label, icon: Icon }) => (
                    <li key={to}>
                        <Link to={to} className={style.item}>
                            <Icon className={style.icon} aria-hidden />
                            <span className={style.label}>{label}</span>
                            <ChevronRight
                                className={style.chevron}
                                aria-hidden
                            />
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
};
