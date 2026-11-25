import { env } from "cloudflare:workers";
import { z } from "zod";
import { AuthServerUnavailableError } from "./auth-server-unavailable";
import { AUTH_DISCOVERY_TIMEOUT_MS } from "./mineauth-timeout";

const serverListSchema = z.array(z.string().min(1));

// サーバー構成はめったに変わらないため、解決結果を isolate 内でキャッシュする
const CACHE_TTL_MS = 60 * 1000;

// 失敗した直後は問い合わせ直さない。1 回のページ表示で何度も呼ばれるため、そのたびに上限まで待たせない
const FAILURE_BACKOFF_MS = 15 * 1000;

/**
 * 解決結果と失敗の記録。
 * Workers ではリクエストをまたいで Promise を共有できないため、解決し終えた値と時刻だけを持つ
 */
interface ResolvedState<T> {
    /** 最後に解決できた値。期限が切れても、取り直せないあいだの代わりに使う */
    last?: { value: T; expiresAt: number };
    /** この時刻までは問い合わせ直さず、手持ちの値か失敗をすぐ返す */
    retryAfter: number;
}

const serverListState: ResolvedState<string[]> = { retryAfter: 0 };
const authServerState: ResolvedState<string> = { retryAfter: 0 };

/**
 * 期限内のキャッシュがあればそれを、無ければ load で取り直す。
 * 取り直せなければ古い値を使い、一度も取れていなければ AuthServerUnavailableError にする
 */
async function resolveWithStale<T>(
    label: string,
    state: ResolvedState<T>,
    load: () => Promise<T>,
): Promise<T> {
    const now = Date.now();
    if (state.last && state.last.expiresAt > now) {
        return state.last.value;
    }
    let cause: unknown;
    if (state.retryAfter <= now) {
        try {
            const value = await load();
            state.last = { value, expiresAt: Date.now() + CACHE_TTL_MS };
            state.retryAfter = 0;
            return value;
        } catch (error) {
            console.warn(`${label} を取り直せません:`, error);
            state.retryAfter = Date.now() + FAILURE_BACKOFF_MS;
            cause = error;
        }
    }
    if (state.last) {
        // MineAuth が一時的に止まっても、前に分かった値でセッションの確認を続ける
        return state.last.value;
    }
    throw new AuthServerUnavailableError({ cause });
}

// SERVER_URL の末尾スラッシュの有無を吸収する
function getBaseUrl(): string {
    return env.SERVER_URL.endsWith("/") ? env.SERVER_URL : `${env.SERVER_URL}/`;
}

export function getServerUrl(server: string): string {
    return `${getBaseUrl()}${server}`;
}

async function fetchServerList(signal: AbortSignal): Promise<string[]> {
    const response = await fetch(`${getBaseUrl()}servers`, { signal });
    if (!response.ok) {
        throw new Error(
            `サーバーリストの取得に失敗しました: ${response.status}`,
        );
    }
    return serverListSchema.parse(await response.json());
}

/** サーバー一覧。signal を渡すと、呼び出し元の待ち時間の上限に合わせて打ち切る */
export function getServers(signal?: AbortSignal): Promise<string[]> {
    return resolveWithStale("サーバーリスト", serverListState, () =>
        fetchServerList(
            signal ?? AbortSignal.timeout(AUTH_DISCOVERY_TIMEOUT_MS),
        ),
    );
}

async function resolveAuthServerUrl(): Promise<string> {
    // サーバー一覧と discovery をまとめて、この時間で打ち切る
    const signal = AbortSignal.timeout(AUTH_DISCOVERY_TIMEOUT_MS);
    const servers = await getServers(signal);
    // 候補へ同時に問い合わせ、一覧の順で最初に応答したサーバーを認証サーバーとする
    const probes = servers.map((server) => {
        const serverUrl = getServerUrl(server);
        return fetch(`${serverUrl}/.well-known/openid-configuration`, {
            signal,
        })
            .then((response) => response.ok)
            .catch((error: unknown) => {
                console.warn(
                    `認証サーバー候補 ${server} に接続できません:`,
                    error,
                );
                return false;
            });
    });
    for (const [index, probe] of probes.entries()) {
        if (await probe) {
            return getServerUrl(servers[index]);
        }
    }
    throw new Error("OIDC discovery に応答するサーバーがありません");
}

/** 認証サーバーの URL。MineAuth に一度もつながっていなければ AuthServerUnavailableError */
export function getAuthServerUrl(): Promise<string> {
    return resolveWithStale(
        "認証サーバー",
        authServerState,
        resolveAuthServerUrl,
    );
}
