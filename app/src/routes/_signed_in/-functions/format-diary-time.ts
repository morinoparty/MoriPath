// Workers は UTC で動くため、サーバーとブラウザで同じ表示になるよう日本時間に固定する
const diaryTimeFormat = new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Tokyo",
});

/** ダイアリーの時刻 (ISO 8601) を日本時間の HH:mm にする */
export const formatDiaryTime = (isoTime: string): string =>
    diaryTimeFormat.format(new Date(isoTime));
