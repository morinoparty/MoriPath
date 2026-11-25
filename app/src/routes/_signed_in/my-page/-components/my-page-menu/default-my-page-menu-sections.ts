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
            // GET /api/v1/plugins/voting/sites/{player} で投票先を取得する
            { id: "vote", label: "投票する", icon: Vote, disabled: true },
            // GET /api/v1/plugins/minestamp/stamps でスタンプを取得する
            { id: "stamps", label: "スタンプ帳", icon: Stamp, disabled: true },
        ],
    },
    {
        id: "land-and-shops",
        title: "土地とお店",
        items: [
            // GET /api/v1/plugins/griefprevention/claims/{player} で保護エリアを取得する
            {
                id: "claims",
                label: "保護エリア",
                icon: LandPlot,
                disabled: true,
            },
            // GET /api/v1/plugins/quickshop/users/{player}/shops でお店を取得する
            { id: "shops", label: "お店", icon: Store, disabled: true },
        ],
    },
    {
        id: "support",
        title: "サポート",
        items: [
            // GET /api/v1/plugins/moripautils/me/tickets で問い合わせを取得する
            {
                id: "tickets",
                label: "お問い合わせ",
                icon: LifeBuoy,
                disabled: true,
            },
        ],
    },
];
