import { createServerFn } from "@tanstack/react-start";
import type { Ticket } from "../-types/ticket";
import { fetchMyTickets, getTicketApi } from "./ticket-api";
import { sortTicketsNewestFirst, toTicket } from "./to-ticket";

/** 自分のお問い合わせを新しい順に取得する。失敗は例外のまま返し、loader 側で受け止める */
export const getMyTickets = createServerFn().handler(
    // oxlint-disable-next-line typescript/no-explicit-any -- request は createServerFn のコンテキストで型が付かない
    async ({ request }: any): Promise<Ticket[]> => {
        const api = await getTicketApi((request as Request).headers);
        const tickets = await fetchMyTickets(api);
        return sortTicketsNewestFirst(tickets.map(toTicket));
    },
);
