import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "../../../../lib/auth";
import { getServerUrl } from "../../../../lib/server-list";
import {
    allStampsResponseSchema,
    type MyStamps,
    playerStampsResponseSchema,
    type Stamp,
} from "../-types/stamp";
// 対応表はサーバー側でだけ読み、クライアントには字形だけを渡す
import stampEmojiMap from "./stamp-emoji.gen.json";
import { toStamp } from "./to-stamp";

const emojiMap: Readonly<Record<string, string>> = stampEmojiMap;

// スタンプの総数はめったに変わらず、一覧は 3000 件を超えるため isolate 内でキャッシュする
const TOTAL_CACHE_TTL_MS = 10 * 60 * 1000;

// Workers ではリクエストをまたいで Promise を共有できないため、取得し終えた値だけを持つ
let totalCache: { value: number; expiresAt: number } | undefined;

async function fetchStampTotal(mainServerUrl: string): Promise<number> {
    // 総数は認証なしで取れる全スタンプの一覧から数える
    const response = await fetch(
        `${mainServerUrl}/api/v1/plugins/minestamp/stamps/all`,
    );
    if (!response.ok) {
        throw new Error(`スタンプ一覧の取得に失敗しました: ${response.status}`);
    }
    return allStampsResponseSchema.parse(await response.json()).stamps.length;
}

async function getStampTotal(mainServerUrl: string): Promise<number> {
    const now = Date.now();
    if (totalCache && totalCache.expiresAt > now) {
        return totalCache.value;
    }
    // 失敗は例外のまま返してキャッシュせず、次のリクエストで取り直す
    const value = await fetchStampTotal(mainServerUrl);
    totalCache = { value, expiresAt: now + TOTAL_CACHE_TTL_MS };
    return value;
}

async function fetchOwnedStamps(
    mainServerUrl: string,
    accessToken: string,
): Promise<Stamp[]> {
    const response = await fetch(
        `${mainServerUrl}/api/v1/plugins/minestamp/stamps`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!response.ok) {
        throw new Error(`所持スタンプの取得に失敗しました: ${response.status}`);
    }
    const data = playerStampsResponseSchema.parse(await response.json());
    return data.stamps
        .map((item) => toStamp(item, emojiMap))
        .filter((stamp): stamp is Stamp => stamp !== null);
}

/** 自分のスタンプと総数を取得する。取得できなければ null (画面側で非表示にする) */
export const getMyStamps = createServerFn().handler(
    // oxlint-disable-next-line typescript/no-explicit-any -- request is not typed
    async ({ request }: any): Promise<MyStamps | null> => {
        try {
            const auth = await getAuth();
            const tokenResult = await auth.api.getAccessToken({
                body: { useAccountCookie: true },
                headers: request.headers,
            });

            if (!tokenResult?.accessToken) {
                return null;
            }

            // MineStamp は main サーバーにのみ存在する
            const mainServerUrl = getServerUrl("main");
            const [owned, total] = await Promise.all([
                fetchOwnedStamps(mainServerUrl, tokenResult.accessToken),
                getStampTotal(mainServerUrl),
            ]);
            return { owned, total };
        } catch (error) {
            console.warn("スタンプを取得できません:", error);
            return null;
        }
    },
);

export type MyStampsData = Awaited<ReturnType<typeof getMyStamps>>;
