import { createFileRoute, useRouter } from "@tanstack/react-router";
import { TicketDetailView } from "./-components/ticket-detail-view";
import { getTicketDetail } from "./-functions/get-ticket-detail";
import { useTicketReply } from "./-functions/use-ticket-reply";
import type { TicketDetailResult } from "./-types/ticket";

// チケットの id は正の整数だけ。Number で正確に扱える 15 桁まで (16 桁は入力の検証で弾かれるため見つからない扱いにする)
const TICKET_ID_PATTERN = /^[1-9]\d{0,14}$/;

export const Route = createFileRoute("/_signed_in/my-page/tickets/$id")({
    loader: async ({
        params,
    }): Promise<{ result: TicketDetailResult | null }> => {
        // 数字でない id は API に問い合わせず、見つからない扱いにする
        if (!TICKET_ID_PATTERN.test(params.id)) {
            return { result: { kind: "not-found" } };
        }
        return {
            // 取れなければ null にして、画面に再読み込みの案内を出す
            result: await getTicketDetail({
                data: { ticketId: Number(params.id) },
            }).catch(() => null),
        };
    },
    component: TicketDetailPage,
});

function TicketDetailPage() {
    const { id } = Route.useParams();
    // 別のお問い合わせへ移ったら、書きかけの返信を持ち越さないよう作り直す
    return <TicketDetailContent key={id} ticketId={Number(id)} />;
}

function TicketDetailContent({ ticketId }: { ticketId: number }) {
    const { result } = Route.useLoaderData();
    const router = useRouter();
    const reply = useTicketReply(ticketId);
    return (
        <TicketDetailView
            result={result}
            reply={{
                content: reply.content,
                canSend: reply.canSend,
                isSending: reply.isSending,
                errorMessage: reply.errorMessage,
                onContentChange: reply.changeContent,
                onSubmit: reply.submit,
            }}
            onRetry={() => router.invalidate()}
        />
    );
}
