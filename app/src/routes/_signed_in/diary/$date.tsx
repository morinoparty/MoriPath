import { Await, createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DiaryDayView } from "./-components/diary-day-view";
import {
    buildDiaryNavState,
    diaryStripEnd,
    toDiaryTermDate,
} from "./-functions/diary-date";
import { getDiaryPage } from "./-functions/get-diary-page";
import {
    type KnownDiaryDates,
    readKnownDiaryDates,
    rememberDiaryDates,
} from "./-functions/known-diary-dates";
import {
    diaryDateSchema,
    type DiaryDayResult,
    type DiaryPageData,
} from "./-types/diary-day";

// 取得に失敗したときの 1 画面分。日付の移動は使えるままにする
const UNAVAILABLE_PAGE: DiaryPageData = {
    result: { kind: "unavailable" },
    existingDates: null,
    latestDate: null,
};

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
    // 取得は待たずに Promise のまま渡し、日付の移動と帯をすぐ出す (タイムラインだけ届くまで場所取り)
    loader: ({ context: { date, today } }) => {
        const stripEnd = diaryStripEnd(date, today);
        const page = getDiaryPage({ data: { date } }).catch(
            (error: unknown): DiaryPageData => {
                console.warn(`${date} のダイアリーを取得できません:`, error);
                return UNAVAILABLE_PAGE;
            },
        );
        // 次に日を移るとき、届くまでの帯の印や「次の日」を今の値で出せるよう覚えておく
        void page.then((value) => rememberDiaryDates(stripEnd, value));
        return { date, today, known: readKnownDiaryDates(stripEnd), page };
    },
    // 一度開いた日に戻ったときは、取り直さずにすぐ出す (サーバー側も同じ長さでキャッシュしている)
    staleTime: 60 * 1000,
    // この日の確認 (beforeLoad) に入ったらすぐ場所取りを出す。親 (_signed_in) のサインイン確認が
    // 終わるまでは出せない (router が子の待ち表示を始めるのはその後) 。
    // 場所取りと届いた画面は同じ形なので、短く切り替わっても点滅しない
    pendingMs: 0,
    pendingMinMs: 0,
    pendingComponent: DiaryDatePending,
    component: DiaryDatePage,
});

interface DiaryDateContentProps {
    date: string;
    today: string;
    known: KnownDiaryDates;
    /** その日のダイアリー。null なら読み込み中 */
    result: DiaryDayResult | null;
}

/** 開いた日の画面。分かっている日記の日から、日付の移動と帯を作る */
const DiaryDateContent = ({
    date,
    today,
    known,
    result,
}: DiaryDateContentProps) => {
    const { lastDate, canGoBack, stripDays } = buildDiaryNavState({
        selected: date,
        today,
        ...known,
    });
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
};

/**
 * 今日を開いたのに今日の日記がまだ無く、前の日の日記が最新のときは、そちらへ移す。
 * ホームの「すべて見る」は今日を開くため、4 時を過ぎて最初の記録が届く前に押したときに働く
 */
const useMoveToLatest = (
    date: string,
    today: string,
    page: DiaryPageData,
): boolean => {
    const navigate = Route.useNavigate();
    const latestDate = page.latestDate;
    const shouldMove =
        date === today &&
        page.result.kind === "empty" &&
        latestDate !== null &&
        latestDate < date;
    useEffect(() => {
        if (shouldMove && latestDate) {
            void navigate({
                to: "/diary/$date",
                params: { date: latestDate },
                replace: true,
            });
        }
    }, [shouldMove, latestDate, navigate]);
    return shouldMove;
};

interface DiaryDateLoadedProps {
    date: string;
    today: string;
    page: DiaryPageData;
}

const DiaryDateLoaded = ({ date, today, page }: DiaryDateLoadedProps) => {
    const isMoving = useMoveToLatest(date, today, page);
    return (
        <DiaryDateContent
            date={date}
            today={today}
            known={page}
            // 最新の日へ移る間は「日記はありません」を一瞬出さず、場所取りのままにする
            result={isMoving ? null : page.result}
        />
    );
};

function DiaryDatePage() {
    const { date, today, known, page } = Route.useLoaderData();
    return (
        // 日ごとに待ち直すよう key を日付にする (同じ枠のままだと前の日を出し続ける)
        <Await
            key={date}
            promise={page}
            fallback={
                <DiaryDateContent
                    date={date}
                    today={today}
                    known={known}
                    result={null}
                />
            }
        >
            {(value) => (
                <DiaryDateLoaded date={date} today={today} page={value} />
            )}
        </Await>
    );
}

/** サインインの確認を待つ間の画面。URL の日付から、届いたあとと同じ形で場所取りする */
function DiaryDatePending() {
    const { date: param } = Route.useParams();
    // 描くたびに時刻を読まないよう、最初の描画で決めた今日を使う
    const [today] = useState(() => toDiaryTermDate(new Date()));
    const parsed = diaryDateSchema.safeParse(param);
    // 読めない日付はこのあと /diary に移るので、その間は今日の形で待つ
    const date = parsed.success && parsed.data <= today ? parsed.data : today;
    return (
        <DiaryDateContent
            date={date}
            today={today}
            known={readKnownDiaryDates(diaryStripEnd(date, today))}
            result={null}
        />
    );
}
