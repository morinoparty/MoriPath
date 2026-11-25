import { env } from "cloudflare:workers";

/** ダイアリー API の接続先。shared key はサーバーでだけ使い、クライアントには渡さない */
export interface DiaryApiConfig {
    /** 末尾スラッシュを取り除いたベース URL */
    url: string;
    sharedKey: string;
}

/**
 * DIARY_API_URL と DIARY_SHARED_KEY を読む。
 * 未設定でもホームを巻き込まないよう、例外にせず null を返す
 */
export function getDiaryApiConfig(): DiaryApiConfig | null {
    // 型の上では必ずあるが、secret を登録し忘れた環境では undefined になりうる
    const url = (env.DIARY_API_URL as string | undefined)?.trim();
    const sharedKey = (env.DIARY_SHARED_KEY as string | undefined)?.trim();
    if (!url || !sharedKey) {
        return null;
    }
    return { url: url.replace(/\/+$/, ""), sharedKey };
}
