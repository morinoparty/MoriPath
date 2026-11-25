import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
    type TicketDetailResult,
    ticketResponseSchema,
} from "../-types/ticket";
import {
    fetchMyTickets,
    fetchTicketComments,
    fetchTicketJson,
    getTicketApi,
    type TicketApi,
    TicketNotFoundError,
} from "./ticket-api";
import { toTicket, toTicketComment } from "./to-ticket";

const getTicketDetailInputSchema = z.object({
    ticketId: z.number().int().positive(),
});

/**
 * 自分のものでないチケットを、スタッフ用の API で取得する。
 * スタッフでなければ 403 になるため、見つからなかった扱いにする
 */
const fetchTicketAsStaff = async (
    api: TicketApi,
    ticketId: number,
): Promise<TicketDetailResult> => {
    try {
        const [ticket, comments] = await Promise.all([
            fetchTicketJson(api, `/tickets/${ticketId}`, ticketResponseSchema),
            fetchTicketComments(api, ticketId, "staff"),
        ]);
        return {
            kind: "found",
            detail: {
                ticket: toTicket(ticket),
                comments: comments.map(toTicketComment),
                isMine: false,
            },
        };
    } catch (error) {
        if (error instanceof TicketNotFoundError) {
            return { kind: "not-found" };
        }
        throw error;
    }
};

/**
 * お問い合わせ 1 件とコメントを取得する。
 * 本人用の 1 件取得 API が無いため、自分の一覧から探し、無ければスタッフとして読めるか試す
 */
export const getTicketDetail = createServerFn()
    .validator(getTicketDetailInputSchema)
    .handler(
        // oxlint-disable-next-line typescript/no-explicit-any -- request は createServerFn のコンテキストで型が付かない
        async ({ data, request }: any): Promise<TicketDetailResult> => {
            const { ticketId } = data as z.infer<
                typeof getTicketDetailInputSchema
            >;
            const api = await getTicketApi((request as Request).headers);

            const myTickets = await fetchMyTickets(api);
            const mine = myTickets.find((ticket) => ticket.id === ticketId);
            if (!mine) {
                return fetchTicketAsStaff(api, ticketId);
            }

            // 自分のチケットでも、スタッフ権限ではなく /me の API でコメントを読む
            const comments = await fetchTicketComments(api, ticketId, "me");
            return {
                kind: "found",
                detail: {
                    ticket: toTicket(mine),
                    comments: comments.map(toTicketComment),
                    isMine: true,
                },
            };
        },
    );
