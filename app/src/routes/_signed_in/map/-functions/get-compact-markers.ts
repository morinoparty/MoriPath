import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getWorldMapUrl } from "../../../../lib/world-map-api";
import { type WorldId, worldIds } from "../-types/world-map";
import {
    compactBaseMarkers,
    compactClaims,
    parseMarkerLayers,
    type SkipCounter,
} from "./compact-markers";
import { buildMarkersUrl } from "./world-map-coords";

// squaremap は数分おきにしかマーカーを書き出さないので、isolate 内で数分使い回す
const CACHE_TTL_MS = 3 * 60 * 1000;
// /map の loader はこの取得を待つため、squaremap が遅いときは早めにあきらめて画面側の再取得に任せる (数 MB あるので少し長め)
const FETCH_TIMEOUT_MS = 5 * 1000;

/** 1 ワールド分の変換済みマーカー。JSON 文字列のまま持ち、そのまま返す */
interface CompactMarkerStrings {
    base: string;
    claims: string;
}

// Workers ではリクエストをまたいで Promise を共有できないため、取得し終えた値だけを持つ
const cache = new Map<
    WorldId,
    { value: CompactMarkerStrings; expiresAt: number }
>();

/** markers.json を取得して、保護範囲以外と保護範囲の 2 つに詰める */
const fetchCompactMarkers = async (
    world: WorldId,
): Promise<CompactMarkerStrings> => {
    const baseUrl = getWorldMapUrl();
    if (!baseUrl) {
        throw new Error("WORLD_MAP_URL が設定されていません");
    }
    const response = await fetch(buildMarkersUrl(baseUrl, world), {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
        throw new Error(
            `markers.json の取得に失敗しました (${response.status})`,
        );
    }
    const layers = parseMarkerLayers(await response.json());
    const counter: SkipCounter = { skipped: 0 };
    const value = {
        base: JSON.stringify(compactBaseMarkers(layers, counter)),
        claims: JSON.stringify(compactClaims(layers, counter)),
    };
    if (counter.skipped > 0) {
        console.warn(
            `${world} の markers.json で形式の合わないマーカーを ${counter.skipped} 件読み飛ばしました`,
        );
    }
    return value;
};

/** キャッシュが新しければそれを、古ければ取り直して返す (失敗はキャッシュしない) */
const getCompactMarkers = async (
    world: WorldId,
): Promise<CompactMarkerStrings> => {
    const now = Date.now();
    const cached = cache.get(world);
    if (cached && cached.expiresAt > now) {
        return cached.value;
    }
    const value = await fetchCompactMarkers(world);
    cache.set(world, { value, expiresAt: now + CACHE_TTL_MS });
    return value;
};

const worldInputSchema = z.object({ world: z.enum(worldIds) });

// 戻り値をオブジェクトにすると Server Function の直列化で数倍に膨らむため、JSON 文字列で返す

/** 保護範囲以外のマーカー (CompactBaseMarkers の JSON 文字列) */
export const getBaseMarkersFn = createServerFn()
    .validator(worldInputSchema)
    .handler(async ({ data }) => (await getCompactMarkers(data.world)).base);

/** 保護範囲 (CompactClaims の JSON 文字列) */
export const getClaimsFn = createServerFn()
    .validator(worldInputSchema)
    .handler(async ({ data }) => (await getCompactMarkers(data.world)).claims);
