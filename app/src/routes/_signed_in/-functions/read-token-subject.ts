import { z } from "zod";

// JWT のペイロードのうち、使うのは sub だけ
const tokenPayloadSchema = z.object({ sub: z.string().min(1) });

/**
 * MineAuth のアクセストークン (JWT) から sub (プレイヤーの UUID) を読む。
 * userinfo と同じ値なので、表示のためだけに /oauth2/userinfo を呼ばずに済ませる。
 * 署名は確かめない (トークンは暗号化クッキーから取り出したもので、API 側が検証する)。
 * 読めなければ null
 */
export function readTokenSubject(token: string): string | null {
    const payload = token.split(".")[1];
    if (!payload) {
        return null;
    }
    try {
        // base64url を base64 に戻してから読む
        const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        const parsed = tokenPayloadSchema.safeParse(JSON.parse(json));
        return parsed.success ? parsed.data.sub : null;
    } catch {
        return null;
    }
}
