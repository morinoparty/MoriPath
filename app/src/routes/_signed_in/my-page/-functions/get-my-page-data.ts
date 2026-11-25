import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getAuth } from "../../../../lib/auth";
import { authMiddleware } from "../../../../lib/auth-middleware";
import { createLoadTimer } from "../../../../lib/load-timer";
import { getPlayerData } from "../../../../lib/player-helpers";
import { fetchMyClaimsWithToken } from "../../-functions/fetch-my-claims";
import { fetchVaultBalance } from "../../-functions/fetch-vault-balance";
import { fetchVoteStats } from "../../-functions/fetch-vote-stats";
import { readTokenSubject } from "../../-functions/read-token-subject";
import type { MyPageStats, PlayerPresence } from "../-types/my-page";
import type { MyStamps } from "../-types/stamp";
import { fetchMyStamps } from "./fetch-my-stamps";
import { toPlayerPresence } from "./to-player-presence";

/** 失敗をログに残して null に落とす。届く途中で例外にして画面を壊さないようにする */
const orNull = <T>(label: string, task: Promise<T>): Promise<T | null> =>
    task.catch((error: unknown) => {
        console.warn(`${label} を取得できません:`, error);
        return null;
    });

/** マイページの loader に返すデータ。名前はブラウザ側のセッションから足す */
export interface MyPageServerData {
    /** Minecraft の UUID (アクセストークンの sub)。取得できなければ null */
    playerId: string | null;
    presence: PlayerPresence | null;
    stats: Promise<MyPageStats>;
    stamps: Promise<MyStamps | null>;
}

/**
 * マイページのデータをまとめて取る。
 * アクセストークンは 1 回だけ取り (更新の Set-Cookie をヘッダーより前に終えるため、ここで待つ)、
 * 数値とスタンプ帳は Promise のまま返してストリームで届いた順に描かせる。
 * オンライン状況は公開の一覧から速く取れ、ポートレートにすぐ出したいため待ってから返す
 */
export const getMyPageData = createServerFn()
    // RPC として直接呼べるため、ここでもサインインを確かめる
    .middleware([authMiddleware])
    .handler(async (): Promise<MyPageServerData> => {
        const timer = createLoadTimer("my-page");
        const auth = await getAuth();
        // MineAuth のアクセストークンは 5 分で切れるため、ここで更新が走ることが多い
        const accessToken = await timer.track(
            "token",
            auth.api
                .getAccessToken({
                    body: { useAccountCookie: true },
                    headers: getRequest().headers,
                })
                .then((result) => result?.accessToken ?? null)
                .catch((error: unknown) => {
                    console.warn("アクセストークンを取得できません:", error);
                    return null;
                }),
        );
        const playerId = accessToken ? readTokenSubject(accessToken) : null;

        // トークンが無ければ、トークンの要る値だけを null にする
        const withToken = <T>(
            name: string,
            fetcher: (token: string) => Promise<T>,
        ): Promise<T | null> =>
            timer.track(
                name,
                accessToken
                    ? orNull(name, fetcher(accessToken))
                    : Promise.resolve(null),
            );

        const balance = withToken("balance", fetchVaultBalance);
        const claims = withToken("claims", fetchMyClaimsWithToken);
        const voteStats = withToken("vote", fetchVoteStats);
        const stamps = withToken("stamps", fetchMyStamps);
        // 数値は 1 枚のカードに並ぶため、3 つそろってから一度に出す
        const stats = Promise.all([balance, claims, voteStats]).then(
            ([balanceValue, claimsValue, voteValue]): MyPageStats => ({
                balance: balanceValue,
                claimBlocks: claimsValue?.remainingClaimBlocks ?? null,
                voteStreak: voteValue?.dayVoteStreak ?? null,
            }),
        );
        const presence = await timer.track(
            "presence",
            playerId
                ? orNull(
                      "presence",
                      getPlayerData(playerId).then(toPlayerPresence),
                  )
                : Promise.resolve(null),
        );
        timer.finish();
        return { playerId, presence, stats, stamps };
    });
