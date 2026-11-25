import type {
    Ticket,
    TicketComment,
} from "@/routes/_signed_in/my-page/tickets/-types/ticket";
import { samplePlayers } from "./sample-players";

/** _NIKOMARU が送ったお問い合わせ (新しい順) */
export const sampleTickets: Ticket[] = [
    {
        id: 42,
        status: "open",
        closeReason: null,
        categoryName: "不具合の報告",
        content:
            "駅前のショップでチェストを開くと、たまに中身が表示されません。\nもう一度開き直すと表示されます。",
        createdAt: "2026-11-24T09:30:00Z",
        player: samplePlayers.nikomaru,
    },
    {
        id: 37,
        status: "closed",
        closeReason: "done",
        categoryName: "保護・土地",
        content:
            "保護した土地の範囲を広げたいのですが、隣の保護と重なってしまいます。",
        createdAt: "2026-11-18T12:05:00Z",
        player: samplePlayers.nikomaru,
    },
    {
        id: 21,
        status: "closed",
        closeReason: "duplicate",
        categoryName: null,
        content: "ログインボーナスが受け取れません。",
        createdAt: "2026-10-30T23:40:00Z",
        player: samplePlayers.nikomaru,
    },
];

/** 一番新しいお問い合わせ (#42) のやりとり (古い順) */
export const sampleTicketComments: TicketComment[] = [
    {
        id: 101,
        authorType: "staff",
        authorId: samplePlayers.chocolatt.id,
        authorName: samplePlayers.chocolatt.name,
        content:
            "ご連絡ありがとうございます。どのショップか、座標を教えてもらえますか？",
        createdAt: "2026-11-24T10:12:00Z",
    },
    {
        id: 102,
        authorType: "player",
        authorId: samplePlayers.nikomaru.id,
        authorName: samplePlayers.nikomaru.name,
        content: "main ワールドの 120, 64, -30 あたりです。",
        createdAt: "2026-11-24T10:20:00Z",
    },
    {
        id: 103,
        authorType: "staff",
        authorId: samplePlayers.kina1120.id,
        authorName: samplePlayers.kina1120.name,
        content: "確認しました。次のメンテナンスで直します。",
        createdAt: "2026-11-24T13:45:00Z",
    },
];
