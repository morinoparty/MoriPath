import type { Meta, StoryObj } from "@storybook/react";
import { Send, Shield } from "lucide-react";
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

// 既定のメニュー (すべてのセクションと準備中の行)
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
