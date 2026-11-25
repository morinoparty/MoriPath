import { createFileRoute, useRouter } from "@tanstack/react-router";
import { TicketListView } from "./-components/ticket-list-view";
import { getMyTickets } from "./-functions/get-my-tickets";

export const Route = createFileRoute("/_signed_in/my-page/tickets/")({
    loader: async () => ({
        // 取れなければ null にして、画面に再読み込みの案内を出す
        tickets: await getMyTickets().catch(() => null),
    }),
    component: TicketListPage,
});

function TicketListPage() {
    const { tickets } = Route.useLoaderData();
    const router = useRouter();
    return (
        <TicketListView tickets={tickets} onRetry={() => router.invalidate()} />
    );
}
