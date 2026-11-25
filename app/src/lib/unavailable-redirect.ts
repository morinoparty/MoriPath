import { redirect } from "@tanstack/react-router";

// サーバーとブラウザの両方から読むため、サーバー専用のモジュールを読み込まない

/** MineAuth に届かないときに案内するページ */
export const UNAVAILABLE_PATH = "/unavailable";

/**
 * 戻り先として使ってよいパスか。外部サイトへ飛ばされないよう、同じオリジンの絶対パスだけを受け付ける。
 * 案内ページ自身へ戻ると繰り返しになるため除く
 */
export function toSafeRedirectPath(value: unknown): string | undefined {
    if (typeof value !== "string") {
        return undefined;
    }
    // "//example.com" や "/\example.com" はブラウザが別オリジンとして扱う
    if (
        !value.startsWith("/") ||
        value.startsWith("//") ||
        value.startsWith("/\\")
    ) {
        return undefined;
    }
    if (
        value === UNAVAILABLE_PATH ||
        value.startsWith(`${UNAVAILABLE_PATH}?`)
    ) {
        return undefined;
    }
    return value;
}

/** 案内ページへのリダイレクト。from には、つながったら戻るページのパスを渡す */
export const redirectToUnavailable = (from?: string) =>
    redirect({
        to: UNAVAILABLE_PATH,
        search: { redirect: toSafeRedirectPath(from) },
    });
