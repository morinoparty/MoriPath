import type { Meta, StoryObj } from "@storybook/react";
import { SendResult } from "@/routes/_signed_in/wallet/send/-components/send-result";
import { samplePlayers } from "../../sample-players";
import { noop, withWalletProviders } from "./wallet-decorator";

const meta: Meta<typeof SendResult> = {
    title: "Wallet/SendResult",
    component: SendResult,
    tags: ["autodocs"],
    decorators: [withWalletProviders],
    args: {
        result: {
            amount: 500,
            balance: 11980,
            recipient: samplePlayers.chocolatt,
        },
        onSendAnother: noop,
    },
};

export default meta;

type Story = StoryObj<typeof SendResult>;

export const Default: Story = {};

// 送れたが応答が読めず、送金後の残高が分からないとき。残高の行を出さない
export const BalanceUnknown: Story = {
    args: {
        result: {
            amount: 500,
            balance: null,
            recipient: samplePlayers.chocolatt,
        },
    },
};
