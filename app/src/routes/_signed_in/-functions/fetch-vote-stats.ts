import { getServers, getServerUrl } from "../../../lib/server-list";
import type { VoteStats } from "../-types/vote-stats";
import { voteStatsResponseSchema } from "../-types/vote-stats";
import { toVoteStats } from "./to-vote-stats";

// VotingPlugin の載っているサーバーはめったに変わらないため isolate 内でキャッシュする
const CACHE_TTL_MS = 60 * 1000;

// Workers ではリクエストをまたいで Promise を共有できないため、解決し終えた値だけを持つ
let votingServerCache: { value: string; expiresAt: number } | undefined;

async function resolveVotingServerUrl(): Promise<string> {
    const servers = await getServers();
    // 認証不要の投票サイト一覧に最初に応答したサーバーを VotingPlugin のサーバーとする
    for (const server of servers) {
        const serverUrl = getServerUrl(server);
        try {
            const response = await fetch(
                `${serverUrl}/api/v1/plugins/voting/sites`,
            );
            if (response.ok) {
                return serverUrl;
            }
        } catch (error) {
            console.warn(`投票サーバー候補 ${server} に接続できません:`, error);
        }
    }
    throw new Error("VotingPlugin のあるサーバーが見つかりません");
}

async function getVotingServerUrl(): Promise<string> {
    const now = Date.now();
    if (votingServerCache && votingServerCache.expiresAt > now) {
        return votingServerCache.value;
    }
    // 失敗は例外のまま返してキャッシュせず、次のリクエストで取り直す
    const value = await resolveVotingServerUrl();
    votingServerCache = { value, expiresAt: now + CACHE_TTL_MS };
    return value;
}

/** アクセストークンで自分の投票状況を取る。取得できなければ null (画面側で非表示にする) */
export async function fetchVoteStats(
    accessToken: string,
): Promise<VoteStats | null> {
    try {
        const votingServerUrl = await getVotingServerUrl();
        const response = await fetch(
            `${votingServerUrl}/api/v1/plugins/voting/stats/me`,
            { headers: { Authorization: `Bearer ${accessToken}` } },
        );

        if (!response.ok) {
            console.warn(`投票状況の取得に失敗しました: ${response.status}`);
            return null;
        }

        // 想定外の形なら parse で例外にして null を返す
        const data = voteStatsResponseSchema.parse(await response.json());
        return toVoteStats(data);
    } catch (error) {
        console.warn("投票状況を取得できません:", error);
        return null;
    }
}
