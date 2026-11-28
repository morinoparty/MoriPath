import { createFileRoute } from "@tanstack/react-router";
import { QuestView } from "./-components/quest-view";
import { getQuestBoard } from "./-functions/get-quest-board";
import { useQuestActions } from "./-functions/use-quest-actions";

export const Route = createFileRoute("/_signed_in/quest/")({
    // 取得できないときは null にして、画面で知らせる
    loader: async () => ({ board: await getQuestBoard() }),
    component: QuestPage,
});

function QuestPage() {
    const { board } = Route.useLoaderData();
    const { session } = Route.useRouteContext();
    const actions = useQuestActions();

    return (
        <QuestView
            session={session}
            board={board}
            orderingDifficulty={actions.orderingDifficulty}
            isRerolling={actions.isRerolling}
            isConfirmingReroll={actions.isConfirmingReroll}
            onOrder={(difficulty) => void actions.orderQuests(difficulty)}
            onRequestReroll={actions.requestReroll}
            onCancelReroll={actions.cancelReroll}
            onConfirmReroll={() => void actions.confirmReroll()}
        />
    );
}
