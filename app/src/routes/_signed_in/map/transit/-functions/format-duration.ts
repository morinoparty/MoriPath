/** 秒 → 「約 26分20秒」。60 秒未満は「約 45秒」、ちょうどの分は「約 3分」。負や NaN は 0 とみなす */
export const formatDuration = (seconds: number): string => {
    // 負・NaN・Infinity は 0 秒として出す
    const total =
        Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds) : 0;
    const minutes = Math.floor(total / 60);
    const rest = total % 60;
    if (minutes === 0) return `約 ${rest}秒`;
    if (rest === 0) return `約 ${minutes}分`;
    return `約 ${minutes}分${rest}秒`;
};
