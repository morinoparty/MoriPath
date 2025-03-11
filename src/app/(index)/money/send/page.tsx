import { AmountInput } from "@/src/components/money/send/amount-input";
import { SessionProvider } from "next-auth/react";
import { SendButton } from "~/components/money/send/send-button";
import { TotalBalance } from "~/components/money/send/total-balance";
import { UsernameInput } from "~/components/money/send/username-input";
import { type ExtendedSession, auth } from "~/lib/auth";

export default async function SendMoneyPage({
    searchParams,
}: {
    searchParams: Promise<{ destination: string | undefined }>;
}) {
    const { destination } = await searchParams;

    const session = await auth();
    const sessionData = session as ExtendedSession;
    const username = sessionData?.user?.name as string;

    const res = await fetch(`${process.env.MAIN_SERVER_URL}/api/v1/plugins/vault/balance/me`, {
        headers: {
            Authorization: `Bearer ${sessionData.accessToken}`,
        },
    });
    const data = await res.json<{ balance: number }>();
    const balance = Math.floor(data?.balance || 0); // 残高を端数切捨てして取得;

    return (
        <>
            <SessionProvider>
                <TotalBalance balance={balance} />
                <UsernameInput initialValue={destination} currentUser={username} />
                <AmountInput balance={balance} />
                <SendButton balance={balance} currentUser={username} />
            </SessionProvider>
        </>
    );
}
