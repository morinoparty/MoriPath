import { createFileRoute, redirect } from "@tanstack/react-router";
import { toDiaryTermDate } from "./-functions/diary-date";

// /diary は今日 (/diary/YYYY-MM-DD) に移す。サーバーには問い合わせず、すぐ移る。
// 今日の日記がまだ無く前の日が最新のときは、/diary/$date の画面が最新の日へ移す
export const Route = createFileRoute("/_signed_in/diary/")({
    beforeLoad: () => {
        throw redirect({
            to: "/diary/$date",
            params: { date: toDiaryTermDate(new Date()) },
            replace: true,
        });
    },
});
