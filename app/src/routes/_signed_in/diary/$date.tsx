import { createFileRoute, redirect } from "@tanstack/react-router";
import { DiaryDayView } from "./-components/diary-day-view";
import {
    addDays,
    buildDiaryStripDays,
    DIARY_STRIP_LENGTH,
    diaryStripEnd,
    hasDiaryBefore,
    toDiaryTermDate,
} from "./-functions/diary-date";
import { getDiaryByDate } from "./-functions/get-diary-by-date";
import { getDiaryDates } from "./-functions/get-diary-dates";
import { getLatestDiaryDate } from "./-functions/get-latest-diary-date";
import { diaryDateSchema, type DiaryDayResult } from "./-types/diary-day";

export const Route = createFileRoute("/_signed_in/diary/$date")({
    beforeLoad: ({ params }) => {
        // ダイアリーは日本時間 4 時で日付が変わるため、今日もその区切りで数える
        const today = toDiaryTermDate(new Date());
        const date = diaryDateSchema.safeParse(params.date);
        // 日付として読めない・まだ来ていない日は、最新の日記に移す
        if (!date.success || date.data > today) {
            throw redirect({ to: "/diary", replace: true });
        }
        return { date: date.data, today };
    },
    loader: async ({ context: { date, today } }) => {
        // 帯に並べる範囲の日記のある日を取る (before は含まないので最後の日の翌日を渡す)
        const stripEnd = diaryStripEnd(date, today);
        // どれかが取れなくても画面は出し、日付の移動は使えるようにする
        const [result, existingDates, latestDate] = await Promise.all([
            getDiaryByDate({ data: { date } }).catch((): DiaryDayResult => ({
                kind: "unavailable",
            })),
            getDiaryDates({
                data: {
                    before: addDays(stripEnd, 1),
                    limit: DIARY_STRIP_LENGTH,
                },
            }).catch(() => null),
            getLatestDiaryDate().catch(() => null),
        ]);
        return {
            date,
            today,
            // 最新より先の日は空なので、そこで「次の日」を止める。最新が分からなければ今日で止める
            lastDate: latestDate && latestDate <= today ? latestDate : today,
            // 最初の日記より前には遡れないようにする
            canGoBack: hasDiaryBefore({
                selected: date,
                existingDates,
                limit: DIARY_STRIP_LENGTH,
            }),
            result,
            stripDays: buildDiaryStripDays({
                selected: date,
                today,
                existingDates,
            }),
        };
    },
    component: DiaryDatePage,
});

function DiaryDatePage() {
    const { date, today, lastDate, canGoBack, result, stripDays } =
        Route.useLoaderData();
    return (
        <DiaryDayView
            date={date}
            today={today}
            lastDate={lastDate}
            canGoBack={canGoBack}
            result={result}
            stripDays={stripDays}
        />
    );
}
