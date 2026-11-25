import type { VoteStats, VoteStatsResponse } from "../-types/vote-stats";

/** API のレスポンスを画面で使う要約に変換する */
export const toVoteStats = (response: VoteStatsResponse): VoteStats => ({
    dayVoteStreak: response.dayVoteStreak,
    bestDayVoteStreak: response.bestDayVoteStreak,
    // 0 以下は「一度も投票していない」なので null にする
    lastVoteTime:
        response.lastVoteTime > 0
            ? new Date(response.lastVoteTime).toISOString()
            : null,
});
