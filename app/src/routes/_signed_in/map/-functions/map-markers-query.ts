import { queryOptions, useQuery } from "@tanstack/react-query";
import type {
    CompactBaseMarkers,
    CompactClaims,
} from "../-types/compact-markers";
import type { WorldId } from "../-types/world-map";
import { getBaseMarkersFn, getClaimsFn } from "./get-compact-markers";

// squaremap のマーカーは数分おきにしか変わらないので、ゆっくり取り直す
export const MARKERS_REFRESH_MS = 5 * 60 * 1000;

// キャッシュには Server Function が返した JSON 文字列のまま持つ。
// SSR で HTML に埋め込むときも膨らまず、中身が同じなら参照も変わらないので図形を作り直さずに済む
const parseBaseMarkers = (json: string) =>
    JSON.parse(json) as CompactBaseMarkers;
const parseClaims = (json: string) => JSON.parse(json) as CompactClaims;

/** 保護範囲以外のマーカー。/map の loader で先に取り、画面と同じキャッシュを使う */
export const baseMarkersQueryOptions = (world: WorldId) =>
    queryOptions({
        queryKey: ["world-map", "markers", "base", world],
        queryFn: () => getBaseMarkersFn({ data: { world } }),
        // loader で取った直後に画面が取り直さないよう、取り直す間隔と同じだけ新しいとみなす
        staleTime: MARKERS_REFRESH_MS,
        select: parseBaseMarkers,
    });

/** 保護範囲以外のマーカーを、数分おきに取り直しながら使う */
export const useBaseMarkers = (world: WorldId) =>
    useQuery({
        ...baseMarkersQueryOptions(world),
        refetchInterval: MARKERS_REFRESH_MS,
        // タブが裏にあるあいだは取り直さない
        refetchIntervalInBackground: false,
    });

/**
 * 保護範囲。1 万件を超えて重いので、「エリア保護」を ON にしたときだけ取る。
 * 一度取ったワールドは OFF にしてもキャッシュが残り、ON に戻せばすぐ出る
 */
export const useClaims = (world: WorldId, enabled: boolean) =>
    useQuery({
        queryKey: ["world-map", "markers", "claims", world],
        queryFn: () => getClaimsFn({ data: { world } }),
        enabled,
        staleTime: MARKERS_REFRESH_MS,
        // 隠しているあいだは取り直さない
        refetchInterval: enabled ? MARKERS_REFRESH_MS : false,
        refetchIntervalInBackground: false,
        select: parseClaims,
    });
