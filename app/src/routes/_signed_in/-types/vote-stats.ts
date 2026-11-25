import { z } from "zod";

/** VotingPlugin アドオン (GET /api/v1/plugins/voting/stats/me) のレスポンス */
export const voteStatsResponseSchema = z.object({
    allTimeTotal: z.number(),
    monthlyTotal: z.number(),
    weeklyTotal: z.number(),
    dailyTotal: z.number(),
    points: z.number(),
    dayVoteStreak: z.number(),
    weekVoteStreak: z.number(),
    monthVoteStreak: z.number(),
    bestDayVoteStreak: z.number(),
    bestWeekVoteStreak: z.number(),
    bestMonthVoteStreak: z.number(),
    // 最後に投票した時刻 (epoch ms)。一度も投票していなければ 0
    lastVoteTime: z.number(),
});

export type VoteStatsResponse = z.infer<typeof voteStatsResponseSchema>;

/** 画面で使う投票の要約 */
export interface VoteStats {
    /** 連続で投票している日数 */
    dayVoteStreak: number;
    /** これまでの最長連続投票日数 */
    bestDayVoteStreak: number;
    /** 最後に投票した時刻 (ISO 8601)。未投票なら null */
    lastVoteTime: string | null;
}
