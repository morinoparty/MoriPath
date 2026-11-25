import { createFileRoute, useRouter } from "@tanstack/react-router";
import { getMyStamps } from "../-functions/get-my-stamps";
import { StampBookPageView } from "./-components/stamp-book-page-view";

export const Route = createFileRoute("/_signed_in/my-page/stamps/")({
    loader: async () => {
        // 通信自体の失敗も null にして、ページ側で再読み込みを促す
        const stamps = await getMyStamps().catch(() => null);
        return { stamps };
    },
    component: StampBookPage,
});

function StampBookPage() {
    const { stamps } = Route.useLoaderData();
    const router = useRouter();
    // invalidate で loader を取り直す
    return (
        <StampBookPageView
            stamps={stamps}
            onRetry={() => router.invalidate()}
        />
    );
}
