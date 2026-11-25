import { env } from "cloudflare:workers";

/**
 * WORLD_MAP_URL の末尾スラッシュを取り除いて返す。
 * 未設定でも他のページを巻き込まないよう、例外にせず null を返す
 */
export function getWorldMapUrl(): string | null {
    // 型の上では必ずあるが、secret を登録し忘れた環境では undefined になりうる
    const url = (env.WORLD_MAP_URL as string | undefined)?.trim();
    return url ? url.replace(/\/+$/, "") : null;
}
