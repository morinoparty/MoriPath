import type { Meta, StoryObj } from "@storybook/react";
import { RerollConfirmDialog } from "@/routes/_signed_in/quest/-components/reroll-confirm-dialog";
import { noop, withQuestFrame } from "./quest-decorator";

const meta: Meta<typeof RerollConfirmDialog> = {
    title: "Quest/RerollConfirmDialog",
    component: RerollConfirmDialog,
    tags: ["autodocs"],
    parameters: {
        // ダイアログは position: fixed なので、ドキュメントでも iframe に分けて表示する
        docs: { story: { inline: false, iframeHeight: 480 } },
    },
    decorators: [withQuestFrame],
    args: {
        open: true,
        rerollCharges: 1,
        isRerolling: false,
        onConfirm: noop,
        onCancel: noop,
    },
};

export default meta;

type Story = StoryObj<typeof RerollConfirmDialog>;

export const Default: Story = {};

// リロールしている最中
export const Rerolling: Story = {
    args: { isRerolling: true },
};
