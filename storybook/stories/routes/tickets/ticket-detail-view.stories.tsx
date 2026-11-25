import type { Meta, StoryObj } from "@storybook/react";
import {
    TicketDetailView,
    type TicketReplyState,
} from "@/routes/_signed_in/my-page/tickets/-components/ticket-detail-view";
import type { TicketDetailResult } from "@/routes/_signed_in/my-page/tickets/-types/ticket";
import { samplePlayers } from "../../sample-players";
import { sampleTicketComments, sampleTickets } from "../../sample-tickets";
import { noop, withTicketProviders } from "./tickets-decorator";

// 何も書いていない返信フォーム
const emptyReply: TicketReplyState = {
    content: "",
    canSend: false,
    isSending: false,
    errorMessage: null,
    onContentChange: noop,
    onSubmit: noop,
};

// 自分の対応中のお問い合わせ (#42) とやりとり
const openTicket: TicketDetailResult = {
    kind: "found",
    detail: {
        ticket: sampleTickets[0],
        comments: sampleTicketComments,
        isMine: true,
    },
};

const meta: Meta<typeof TicketDetailView> = {
    title: "Tickets/TicketDetailView",
    component: TicketDetailView,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
    decorators: [withTicketProviders],
    args: {
        result: openTicket,
        reply: emptyReply,
        onRetry: noop,
    },
};

export default meta;

type Story = StoryObj<typeof TicketDetailView>;

// 自分の対応中のお問い合わせ。返信フォームを出す
export const Open: Story = {};

// 返信を書いている途中
export const Typing: Story = {
    args: {
        reply: {
            ...emptyReply,
            content: "ありがとうございます。よろしくお願いします。",
            canSend: true,
        },
    },
};

// 返信を送っているところ (入力と送るボタンを止める)
export const Sending: Story = {
    args: {
        reply: {
            ...emptyReply,
            content: "ありがとうございます。よろしくお願いします。",
            isSending: true,
        },
    },
};

// 返信を送れなかったとき
export const SendError: Story = {
    args: {
        reply: {
            ...emptyReply,
            content: "ありがとうございます。よろしくお願いします。",
            canSend: true,
            errorMessage: "送れませんでした。もう一度ためしてください",
        },
    },
};

// まだ返信が無いお問い合わせ
export const NoComments: Story = {
    args: {
        result: {
            kind: "found",
            detail: { ...openTicket.detail, comments: [] },
        },
    },
};

// クローズしたお問い合わせ。返信フォームは出さない
export const Closed: Story = {
    args: {
        result: {
            kind: "found",
            detail: {
                ticket: sampleTickets[1],
                comments: [
                    {
                        id: 201,
                        authorType: "staff",
                        authorId: samplePlayers.hikighaL.id,
                        authorName: samplePlayers.hikighaL.name,
                        content: "保護の範囲を調整しました。ご確認ください。",
                        createdAt: "2026-11-19T02:10:00Z",
                    },
                ],
                isMine: true,
            },
        },
    },
};

// 他人のお問い合わせをスタッフとして見ているとき。返信フォームは出さない
export const ViewedAsStaff: Story = {
    args: {
        result: {
            kind: "found",
            detail: {
                ticket: {
                    ...sampleTickets[0],
                    id: 58,
                    player: samplePlayers.tututututu201,
                },
                comments: [
                    {
                        id: 301,
                        authorType: "player",
                        authorId: samplePlayers.tututututu201.id,
                        authorName: samplePlayers.tututututu201.name,
                        content: "追加で写真を送ります。",
                        createdAt: "2026-11-24T11:00:00Z",
                    },
                ],
                isMine: false,
            },
        },
    },
};

// 見つからないお問い合わせ
export const NotFound: Story = {
    args: { result: { kind: "not-found" } },
};

// 読み込めなかったとき
export const LoadError: Story = {
    args: { result: null },
};
