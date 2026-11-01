import { env } from "cloudflare:workers";
import { z } from "zod";

const serverListSchema = z.array(z.string().min(1));

// サーバー構成はめったに変わらないため、解決結果を isolate 内でキャッシュする
const CACHE_TTL_MS = 60 * 1000;

type Cached<T> = { value: Promise<T>; expiresAt: number };

let serverListCache: Cached<string[]> | undefined;
let authServerCache: Cached<string> | undefined;

// SERVER_URL の末尾スラッシュの有無を吸収する
function getBaseUrl(): string {
    return env.SERVER_URL.endsWith("/") ? env.SERVER_URL : `${env.SERVER_URL}/`;
}

export function getServerUrl(server: string): string {
    return `${getBaseUrl()}${server}`;
}

async function fetchServerList(): Promise<string[]> {
    const response = await fetch(`${getBaseUrl()}servers`);
    if (!response.ok) {
        throw new Error(
            `サーバーリストの取得に失敗しました: ${response.status}`,
        );
    }
    return serverListSchema.parse(await response.json());
}

export function getServers(): Promise<string[]> {
    const now = Date.now();
    if (!serverListCache || serverListCache.expiresAt <= now) {
        const value = fetchServerList();
        // 失敗した Promise はキャッシュしない
        value.catch(() => {
            if (serverListCache?.value === value) {
                serverListCache = undefined;
            }
        });
        serverListCache = { value, expiresAt: now + CACHE_TTL_MS };
    }
    return serverListCache.value;
}

async function resolveAuthServerUrl(): Promise<string> {
    const servers = await getServers();
    // OIDC discovery に最初に応答したサーバーを認証サーバーとする
    for (const server of servers) {
        const serverUrl = getServerUrl(server);
        try {
            const response = await fetch(
                `${serverUrl}/.well-known/openid-configuration`,
            );
            if (response.ok) {
                return serverUrl;
            }
        } catch (error) {
            console.warn(`認証サーバー候補 ${server} に接続できません:`, error);
        }
    }
    throw new Error("利用可能な認証サーバーが見つかりません");
}

export function getAuthServerUrl(): Promise<string> {
    const now = Date.now();
    if (!authServerCache || authServerCache.expiresAt <= now) {
        const value = resolveAuthServerUrl();
        // 失敗した Promise はキャッシュしない
        value.catch(() => {
            if (authServerCache?.value === value) {
                authServerCache = undefined;
            }
        });
        authServerCache = { value, expiresAt: now + CACHE_TTL_MS };
    }
    return authServerCache.value;
}
