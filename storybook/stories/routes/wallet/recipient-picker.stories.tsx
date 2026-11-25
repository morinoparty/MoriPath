import type { Meta, StoryObj } from "@storybook/react";
import { RecipientPicker } from "@/routes/_signed_in/wallet/send/-components/recipient-picker";
import { samplePlayers } from "../../sample-players";
import {
    noop,
    sampleSuggestions,
    withWalletProviders,
} from "./wallet-decorator";

const meta: Meta<typeof RecipientPicker> = {
    title: "Wallet/RecipientPicker",
    component: RecipientPicker,
    tags: ["autodocs"],
    decorators: [withWalletProviders],
    args: {
        suggestions: sampleSuggestions,
        recipientName: "",
        recipientState: { status: "empty" },
        onRecipientNameChange: noop,
        onPick: noop,
    },
};

export default meta;

type Story = StoryObj<typeof RecipientPicker>;

export const Empty: Story = {};

// 候補から選んだ状態。顔を枠で囲み、入力欄にチェックを出す
export const Picked: Story = {
    args: {
        recipientName: samplePlayers.chocolatt.name,
        recipientState: { status: "found", recipient: samplePlayers.chocolatt },
    },
};

export const Checking: Story = {
    args: {
        recipientName: "hikigha",
        recipientState: { status: "checking" },
    },
};

export const NotFound: Story = {
    args: {
        recipientName: "hikighaLL",
        recipientState: {
            status: "error",
            message: "このMinecraft IDのプレイヤーは見つかりません",
        },
    },
};

// オンラインの人がいないときは候補の列を出さない
export const NoSuggestions: Story = {
    args: { suggestions: [] },
};
