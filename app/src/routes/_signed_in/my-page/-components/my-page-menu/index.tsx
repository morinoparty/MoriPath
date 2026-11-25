import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { type ReactNode, useId } from "react";
import { cx, sva } from "../../../../../../styled-system/css";
import type {
    MyPageMenuItem as MyPageMenuItemData,
    MyPageMenuSection as MyPageMenuSectionData,
} from "../../-types/my-page-menu";
import { defaultMyPageMenuSections } from "./default-my-page-menu-sections";

const myPageMenuStyle = sva({
    slots: [
        "root",
        "section",
        "title",
        "list",
        "item",
        "icon",
        "label",
        "chevron",
        "badge",
    ],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            // 区切り線は使わず、セクション同士は余白だけで分ける
            gap: "6",
        },
        section: {
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
            // タッチ領域を 44px 以上に保つ
            minHeight: "44px",
            paddingX: "4",
            paddingY: "14px",
            color: "colorPalette.fg",
            textDecoration: "none",
            transition: "background 0.15s",
            // リンクの行だけ押したときの面の変化を付ける
            "&:is(a)": {
                _hover: { bg: "colorPalette.surface.hover" },
                _active: { bg: "colorPalette.surface.active" },
            },
            // 準備中の行はアイコンとラベルを控えめな色にする
            "&[aria-disabled=true]": {
                color: "colorPalette.fg.muted",
                cursor: "default",
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
        badge: {
            flexShrink: 0,
            fontSize: "12px",
            fontWeight: "medium",
            lineHeight: "1.5",
            color: "colorPalette.fg.subtle",
        },
    },
});

export interface MyPageMenuItemProps {
    item: MyPageMenuItemData;
}

/** メニューの 1 行。href があればリンク、無ければ押せない「準備中」の行にする */
const MyPageMenuItem = ({ item }: MyPageMenuItemProps) => {
    const style = myPageMenuStyle();
    const { label, icon: Icon } = item;
    if (item.href === undefined) {
        return (
            <li>
                {/* リンクにしないことでフォーカスもクリックも受けない */}
                <div aria-disabled="true" className={style.item}>
                    <Icon className={style.icon} aria-hidden />
                    <span className={style.label}>{label}</span>
                    <span className={style.badge}>準備中</span>
                </div>
            </li>
        );
    }
    return (
        <li>
            <Link to={item.href} className={style.item}>
                <Icon className={style.icon} aria-hidden />
                <span className={style.label}>{label}</span>
                <ChevronRight className={style.chevron} aria-hidden />
            </Link>
        </li>
    );
};

export interface MyPageMenuSectionProps {
    title: string;
    /** MyPageMenu.Item を並べる */
    children: ReactNode;
    className?: string;
}

/** 見出し付きのまとまり。見出しをセクションのアクセシブルな名前にする */
const MyPageMenuSection = ({
    title,
    children,
    className,
}: MyPageMenuSectionProps) => {
    const style = myPageMenuStyle();
    // 見出しとセクションを結び付ける id (同じページに複数置いても重複しない)
    const titleId = useId();
    return (
        <section
            aria-labelledby={titleId}
            className={cx(style.section, className)}
        >
            <h2 id={titleId} className={style.title}>
                {title}
            </h2>
            <ul className={style.list}>{children}</ul>
        </section>
    );
};

export interface MyPageMenuProps {
    /** 表示するセクション (省略時は既定のメニュー) */
    sections?: readonly MyPageMenuSectionData[];
    className?: string;
}

/** マイページのメニュー。データからセクションと行を組み立てる */
const MyPageMenuRoot = ({
    sections = defaultMyPageMenuSections,
    className,
}: MyPageMenuProps) => {
    const style = myPageMenuStyle();
    // 行の無いセクションは見出しだけ残さないよう外す
    const visibleSections = sections.filter(
        (section) => section.items.length > 0,
    );
    if (visibleSections.length === 0) {
        return null;
    }
    return (
        <div className={cx(style.root, className)}>
            {visibleSections.map((section) => (
                <MyPageMenuSection key={section.id} title={section.title}>
                    {section.items.map((item) => (
                        <MyPageMenuItem key={item.id} item={item} />
                    ))}
                </MyPageMenuSection>
            ))}
        </div>
    );
};

/** データ駆動の MyPageMenu と、組み立て用の Section / Item */
export const MyPageMenu = Object.assign(MyPageMenuRoot, {
    Section: MyPageMenuSection,
    Item: MyPageMenuItem,
});
