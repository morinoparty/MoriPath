import type { Meta, StoryObj } from "@storybook/react";
import { SendConfirmDialog } from "@/routes/_signed_in/wallet/send/-components/send-confirm-dialog";
import { samplePlayers } from "../../sample-players";
import { noop, withWalletProviders } from "./wallet-decorator";

const meta: Meta<typeof SendConfirmDialog> = {
    title: "Wallet/SendConfirmDialog",
    component: SendConfirmDialog,
    tags: ["autodocs"],
    parameters: {
        // Portal に出るため、ドキュメントでも iframe に分けて表示する
        docs: { story: { inline: false, iframeHeight: 520 } },
    },
    decorators: [withWalletProviders],
    args: {
        open: true,
        recipient: samplePlayers.chocolatt,
        amount: 500,
        balance: 12480,
        isSending: false,
        failure: null,
        onConfirm: noop,
        onCancel: noop,
    },
};

export default meta;

type Story = StoryObj<typeof SendConfirmDialog>;

export const Default: Story = {};

export const Sending: Story = {
    args: { isSending: true },
};

export const Rejected: Story = {
    args: { failure: { kind: "rejected", message: "残高が足りません" } },
};
