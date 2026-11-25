import type { LucideIcon } from "lucide-react";

/** メニュー行の共通部分 */
interface MyPageMenuItemBase {
    /** React の key とテストで使う、セクション内で一意な ID */
    id: string;
    label: string;
    icon: LucideIcon;
}

/** 遷移先のある行。画面ができたら disabled をこちらの href に差し替える */
export interface MyPageMenuLinkItem extends MyPageMenuItemBase {
    // まだ型付きルートに無いページも渡せるよう文字列で持つ
    href: string;
    /** true なら外部サイトへのリンクとして新しいタブで開く */
    external?: boolean;
    disabled?: never;
}

/** 画面がまだ無い行。押せない「準備中」として表示する */
export interface MyPageMenuDisabledItem extends MyPageMenuItemBase {
    disabled: true;
    href?: never;
    external?: never;
}

/** メニューの 1 行。href と disabled のどちらか一方だけを持つ */
export type MyPageMenuItem = MyPageMenuLinkItem | MyPageMenuDisabledItem;

/** 見出し付きのメニューのまとまり */
export interface MyPageMenuSection {
    id: string;
    title: string;
    items: readonly MyPageMenuItem[];
}
