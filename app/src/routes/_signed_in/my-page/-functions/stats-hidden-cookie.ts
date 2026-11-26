// マイページの数値を隠すかどうかを保存する cookie。SSR の時点から隠した状態で描くため、サーバーでも読める cookie に置く
export const STATS_HIDDEN_COOKIE = "moripath_stats_hidden";

// 隠すときだけこの値を入れ、それ以外の値はすべて「表示」として扱う
const HIDDEN_VALUE = "1";

// 端末を変えない限り覚えておけるよう、1 年残す
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/** cookie の値から、数値を隠すかどうかを返す */
export const isStatsHiddenValue = (value: string | undefined): boolean =>
    value === HIDDEN_VALUE;

/** document.cookie の文字列から、数値を隠すかどうかを返す */
export const readStatsHidden = (cookieHeader: string): boolean => {
    const entry = cookieHeader
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${STATS_HIDDEN_COOKIE}=`));
    return isStatsHiddenValue(entry?.slice(STATS_HIDDEN_COOKIE.length + 1));
};

/**
 * document.cookie に書く文字列を作る。
 * クライアント側の遷移では loader が Server Function の URL を叩くため、Path は / にしてどこからでも送られるようにする
 */
export const serializeStatsHidden = (hidden: boolean): string =>
    `${STATS_HIDDEN_COOKIE}=${hidden ? HIDDEN_VALUE : "0"}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax`;
