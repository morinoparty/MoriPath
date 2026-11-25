import type { DiaryEntry } from "./diary";

/**
 * ホームの loader が返すデータ。
 * playerId だけはすぐ返し、時間のかかる値は Promise のまま返して届いた順に描く
 */
export interface HomeData {
    /** Minecraft の UUID (アクセストークンの sub)。取得できなければ null */
    playerId: string | null;
    /** どんぐり (Vault 残高)。取得できなければ null */
    balance: Promise<number | null>;
    /** 残りの保護ブロック数。取得できなければ null */
    claimBlocks: Promise<number | null>;
    /** 連続投票日数。取得できなければ null */
    voteStreak: Promise<number | null>;
    /** ダイアリーの記録 (タームの順)。取得できなければ null */
    diaryEntries: Promise<DiaryEntry[] | null>;
}
