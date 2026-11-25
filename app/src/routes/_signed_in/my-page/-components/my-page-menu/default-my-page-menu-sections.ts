import {
    CalendarDays,
    LandPlot,
    LifeBuoy,
    Send,
    Shield,
    Stamp,
    Store,
    Vote,
} from "lucide-react";
import type { MyPageMenuSection } from "../../-types/my-page-menu";

/** マイページの既定メニュー。準備中の行は画面ができたら href に差し替える */
export const defaultMyPageMenuSections: readonly MyPageMenuSection[] = [
    {
        id: "money",
        title: "おかね",
        items: [
            {
                id: "send",
                label: "どんぐりを送る",
                icon: Send,
                href: "/wallet/send",
            },
            // 取引履歴を返す API はまだ無い
            {
                id: "history",
                label: "どんぐりの履歴",
                icon: CalendarDays,
                disabled: true,
            },
            {
                id: "claim-blocks",
                label: "保護ブロックを買う",
                icon: Shield,
                href: "/balance-claim",
            },
        ],
    },
    {
        id: "play",
        title: "あそび",
        items: [
            // 投票は minecraft.jp のサーバーページで行うため、外部リンクにする
            {
                id: "vote",
                label: "投票する",
                icon: Vote,
                href: "https://minecraft.jp/servers/visit.morino.party",
                external: true,
            },
            {
                id: "stamps",
                label: "スタンプ帳",
                icon: Stamp,
                href: "/my-page/stamps",
            },
        ],
    },
    {
        id: "land-and-shops",
        title: "土地とお店",
        items: [
            {
                id: "claims",
                label: "保護した土地",
                icon: LandPlot,
                href: "/my-page/claims",
            },
            { id: "shops", label: "自分のお店", icon: Store, href: "/my-page/shops" },
        ],
    },
    {
        id: "support",
        title: "サポート",
        items: [
            {
                id: "tickets",
                label: "お問い合わせ",
                icon: LifeBuoy,
                href: "/my-page/tickets",
            },
        ],
    },
];
