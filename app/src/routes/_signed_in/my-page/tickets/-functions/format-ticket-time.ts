// Workers は UTC で動くため、サーバーとブラウザで同じ表示になるよう日本時間に固定する
const ticketTimeFormat = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Tokyo",
});

/**
 * チケットやコメントの日時 (ISO-8601) を日本時間の「2026/11/24 18:30」にする。
 * 相対表記 (「3分前」) は SSR とブラウザで食い違うため使わない。読めない値はそのまま返す
 */
export const formatTicketTime = (isoTime: string): string => {
    const date = new Date(isoTime);
    if (Number.isNaN(date.getTime())) {
        return isoTime;
    }
    return ticketTimeFormat.format(date);
};
