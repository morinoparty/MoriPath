import { createFileRoute, redirect } from "@tanstack/react-router";
import { toDiaryTermDate } from "./-functions/diary-date";
import { getLatestDiaryDate } from "./-functions/get-latest-diary-date";

// /diary はいちばん新しい日記の日 (/diary/YYYY-MM-DD) に移す
export const Route = createFileRoute("/_signed_in/diary/")({
    loader: async () => {
        const today = toDiaryTermDate(new Date());
        const latest = await getLatestDiaryDate().catch(() => null);
        // 最新が取れない・時計のずれで未来になっているときは今日を開く (/diary/$date から戻されてループしないように)
        const date = latest && latest <= today ? latest : today;
        throw redirect({
            to: "/diary/$date",
            params: { date },
            replace: true,
        });
    },
});
