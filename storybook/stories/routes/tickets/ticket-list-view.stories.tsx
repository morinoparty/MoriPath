import type { Meta, StoryObj } from "@storybook/react";
import { TicketListView } from "@/routes/_signed_in/my-page/tickets/-components/ticket-list-view";
import { sampleTickets } from "../../sample-tickets";
import { noop, withTicketProviders } from "./tickets-decorator";

const meta: Meta<typeof TicketListView> = {
    title: "Tickets/TicketListView",
    component: TicketListView,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
    decorators: [withTicketProviders],
    args: {
        tickets: sampleTickets,
        onRetry: noop,
    },
};

export default meta;

type Story = StoryObj<typeof TicketListView>;

// 対応中とクローズしたお問い合わせが並んだ状態
export const Default: Story = {};

// まだ何も送っていないとき
export const Empty: Story = {
    args: { tickets: [] },
};

// 一覧を読み込めなかったとき
export const LoadError: Story = {
    args: { tickets: null },
};
