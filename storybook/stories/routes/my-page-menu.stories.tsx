import type { Meta, StoryObj } from "@storybook/react";
import { Send, Shield, Stamp, Vote } from "lucide-react";
import { MyPageMenu } from "@/routes/_signed_in/my-page/-components/my-page-menu";
import { css } from "../../styled-system/css";

const meta: Meta<typeof MyPageMenu> = {
    title: "MyPage/MyPageMenu",
    component: MyPageMenu,
    tags: ["autodocs"],
    decorators: [
        // ページの地の上に置いたときの見え方を確かめる
        (Story) => (
            <div
                className={css({
                    width: "354px",
                    padding: "4",
                    bg: "colorPalette.bg",
                })}
            >
                <Story />
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof MyPageMenu>;

// 既定のメニュー (すべてのセクション。外部リンクと準備中の行も含む)
export const Default: Story = {};

// 送金画面ができたときの並び (disabled を href に差し替えた例)
export const SendEnabled: Story = {
    args: {
        sections: [
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
                    {
                        id: "claim-blocks",
                        label: "保護ブロックを買う",
                        icon: Shield,
                        href: "/balance-claim",
                    },
                ],
            },
        ],
    },
};

// 外部サイトへのリンク (新しいタブで開き、矢印の代わりに外部リンクのアイコンを出す)
export const ExternalLinkItem: Story = {
    args: {
        sections: [
            {
                id: "play",
                title: "あそび",
                items: [
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
        ],
    },
};
