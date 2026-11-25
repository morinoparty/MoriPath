import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getMineAuthAccessToken } from "../../../lib/auth";
import { authMiddleware } from "../../../lib/auth-middleware";
import { createLoadTimer } from "../../../lib/load-timer";
import type { HomeData } from "../-types/home-data";
import { fetchLatestDiaryEntries } from "./fetch-latest-diary-entries";
import { fetchMyClaimsWithToken } from "./fetch-my-claims";
import { fetchVaultBalance } from "./fetch-vault-balance";
import { fetchVoteStats } from "./fetch-vote-stats";
import { readTokenSubject } from "./read-token-subject";

/** 失敗をログに残して null に落とす。届く途中で例外にして画面を壊さないようにする */
const orNull = <T>(label: string, task: Promise<T>): Promise<T | null> =>
    task.catch((error: unknown) => {
        console.warn(`${label} を取得できません:`, error);
        return null;
    });

/**
 * ホームのデータをまとめて取る。
 * アクセストークンは 1 回だけ取り、MineAuth への問い合わせを並べて投げる。
 * トークンの更新 (Set-Cookie) は応答のヘッダーを送る前に終える必要があるため、トークンだけはここで待ち、
 * 各値は Promise のまま返して、ストリームで届いた順に描かせる
 */
export const getHomeData = createServerFn()
    // RPC として直接呼べるため、ここでもサインインを確かめる
    .middleware([authMiddleware])
    .handler(async (): Promise<HomeData> => {
        const timer = createLoadTimer("home");
        // ダイアリーはトークンを使わないため、トークンを待たずに取り始める
        const diaryEntries = timer.track("diary", fetchLatestDiaryEntries());

        // MineAuth のアクセストークンは 5 分で切れるため、ここで更新が走ることが多い
        const accessToken = await timer.track(
            "token",
            getMineAuthAccessToken(getRequest().headers)
                .then((result) => result?.accessToken ?? null)
                .catch((error: unknown) => {
                    console.warn("アクセストークンを取得できません:", error);
                    return null;
                }),
        );

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

        const claims = withToken("claims", fetchMyClaimsWithToken);
        const voteStats = withToken("vote", fetchVoteStats);
        const data: HomeData = {
            playerId: accessToken ? readTokenSubject(accessToken) : null,
            balance: withToken("balance", fetchVaultBalance),
            claimBlocks: claims.then(
                (value) => value?.remainingClaimBlocks ?? null,
            ),
            voteStreak: voteStats.then((value) => value?.dayVoteStreak ?? null),
            diaryEntries,
        };
        timer.finish();
        return data;
    });
