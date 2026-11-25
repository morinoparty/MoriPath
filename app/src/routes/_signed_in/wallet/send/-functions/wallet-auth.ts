import { getAuth } from "../../../../../lib/auth";
import { toDashedUuid } from "../../../../../lib/player-helpers";
import { getAuthServerUrl } from "../../../../../lib/server-list";
import type { UserInfoData } from "../../../../../types/player";

/** ログイン中のプレイヤー。アクセストークンと、自分宛ての送金を弾くための UUID・名前 */
export interface WalletAuth {
    accessToken: string;
    self: { id: string | null; name: string | null };
}

/**
 * サーバー関数の中で、MineAuth のアクセストークンと自分の UUID を取る (サーバー専用)。
 * UUID はマイページと同じく userinfo の sub から取り、取れなければ null のまま返す
 */
export const getWalletAuth = async (headers: Headers): Promise<WalletAuth> => {
    const auth = await getAuth();
    const tokenResult = await auth.api.getAccessToken({
        body: { useAccountCookie: true },
        headers,
    });
    if (!tokenResult?.accessToken) {
        throw new Error("No access token available");
    }
    const accessToken = tokenResult.accessToken;

    // 自分の確認ができなくても送金 API 側でも弾かれるため、ここでは失敗を null にする
    const userInfo = await getAuthServerUrl()
        .then((authServerUrl) =>
            fetch(`${authServerUrl}/oauth2/userinfo`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            }),
        )
        .then((response) =>
            response.ok ? (response.json() as Promise<UserInfoData>) : null,
        )
        .catch(() => null);

    return {
        accessToken,
        self: {
            id: userInfo?.sub ? toDashedUuid(userInfo.sub) : null,
            name: userInfo?.preferred_username ?? null,
        },
    };
};

/** 送り先が自分自身か。UUID が分かれば UUID で、分からなければ名前で比べる */
export const isSelf = (
    self: WalletAuth["self"],
    target: { id: string; name?: string },
): boolean => {
    if (self.id) {
        return self.id === toDashedUuid(target.id);
    }
    return (
        self.name !== null &&
        target.name !== undefined &&
        self.name.toLowerCase() === target.name.toLowerCase()
    );
};
