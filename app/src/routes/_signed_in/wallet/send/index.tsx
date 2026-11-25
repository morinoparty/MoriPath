import { createFileRoute } from "@tanstack/react-router";
import { getOnlinePlayers, getVaultBalance } from "../../-functions";
import { WalletSendView } from "./-components/wallet-send-view";
import { useWalletSend } from "./-functions/use-wallet-send";
import type { Recipient } from "./-types/wallet-send";

// 候補として並べる人数の上限。多いときは横スクロールで見せる
const MAX_SUGGESTIONS = 12;

export const Route = createFileRoute("/_signed_in/wallet/send/")({
    loader: async ({ context }) => {
        // 最近の送り先を返す API は無いため、いまオンラインの人を候補にする
        const [balance, onlinePlayers] = await Promise.all([
            // 残高が取れなければ null にして、送るボタンを押せなくする
            getVaultBalance().catch(() => null),
            getOnlinePlayers().catch(() => []),
        ]);
        const myName = context.session?.user.name.toLowerCase();
        const myId = context.session?.user.id;
        // 自分には送れないため候補から外す
        const suggestions: Recipient[] = onlinePlayers
            .filter(
                (player) =>
                    player.id !== myId &&
                    player.username.toLowerCase() !== myName,
            )
            .slice(0, MAX_SUGGESTIONS)
            .map((player) => ({ id: player.id, name: player.username }));
        return { balance, suggestions };
    },
    component: WalletSendPage,
});

function WalletSendPage() {
    const { balance, suggestions } = Route.useLoaderData();
    const wallet = useWalletSend(balance);
    return (
        <WalletSendView
            balance={balance}
            suggestions={suggestions}
            recipientName={wallet.recipientName}
            recipientState={wallet.recipientState}
            amount={wallet.amount}
            canSend={wallet.canSend}
            step={wallet.step}
            isSending={wallet.isSending}
            sendFailure={wallet.sendFailure}
            result={wallet.result}
            onRecipientNameChange={wallet.changeRecipientName}
            onPickRecipient={wallet.pickRecipient}
            onAmountKey={wallet.pressAmountKey}
            onFillAll={wallet.fillAllAmount}
            onRequestConfirm={wallet.requestConfirm}
            onCancelConfirm={wallet.cancelConfirm}
            onConfirmSend={wallet.confirmSend}
            onSendAnother={wallet.sendAnother}
        />
    );
}
