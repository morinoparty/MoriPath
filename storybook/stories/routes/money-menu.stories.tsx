import type { Meta, StoryObj } from "@storybook/react";
import { CalendarDays, Send, Shield } from "lucide-react";
import { MoneyMenu } from "@/routes/_signed_in/my-page/-components/money-menu";
import { css } from "../../styled-system/css";

const meta: Meta<typeof MoneyMenu> = {
    title: "MyPage/MoneyMenu",
    component: MoneyMenu,
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

type Story = StoryObj<typeof MoneyMenu>;

// いまのアプリで遷移先がある項目だけ
export const Default: Story = {};

// ページが増えたときの並び (遷移先はダミー)
export const MultipleItems: Story = {
    args: {
        items: [
            { to: "/wallet/send", label: "どんぐりを送る", icon: Send },
            {
                to: "/wallet/history",
                label: "どんぐりの履歴",
                icon: CalendarDays,
            },
            { to: "/balance-claim", label: "保護ブロックを買う", icon: Shield },
        ],
    },
};
