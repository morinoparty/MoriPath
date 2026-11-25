import { z } from "zod";
import type {
    BorderLine,
    CompactBaseMarkers,
    CompactClaim,
    CompactClaims,
    MapPinData,
    PointTuple,
    RailwayCircle,
    RailwayLine,
} from "../-types/compact-markers";
import { buildNumberingColors } from "./numbering-colors";
import { parseClaimPopup } from "./parse-claim-popup";
import {
    parseRailwayPopup,
    parseStationName,
    parseStationNumberings,
} from "./parse-railway-popup";
import { stripMarkerHtml } from "./strip-marker-html";

// squaremap の markers.json を緩く検証する。壊れたマーカーは 1 件ずつ読み飛ばし、ファイル全体は落とさない
const vec2Schema = z.object({ x: z.number(), z: z.number() });

const layerSchema = z.object({
    id: z.string(),
    // マーカーはレイヤーの種類ごとに別のスキーマで 1 件ずつ検証する
    markers: z.array(z.unknown()),
});

const circleSchema = z.object({
    type: z.literal("circle"),
    center: vec2Schema,
    radius: z.number(),
    popup: z.string().optional(),
});

const polylineSchema = z.object({
    type: z.literal("polyline"),
    points: z.array(vec2Schema),
    color: z.string().optional(),
    fillColor: z.string().optional(),
    popup: z.string().optional(),
});

const rectangleSchema = z.object({
    type: z.literal("rectangle"),
    points: z.tuple([vec2Schema, vec2Schema]),
    popup: z.string().optional(),
});

const iconSchema = z.object({
    type: z.literal("icon"),
    point: vec2Schema,
    tooltip: z.string().optional(),
});

type Polyline = z.infer<typeof polylineSchema>;

/** squaremap のレイヤー ID (表示項目との対応はこの ID で決まる) */
const LAYER_IDS = {
    railway: "Railway",
    claims: "griefprevention",
    spawn: "squaremap-spawn_icon",
    worldBorder: "squaremap-worldborder",
    banners: "banners",
} as const;

/** 検証済みのレイヤー (ID → マーカー)。検証できなかったレイヤーは入らない */
export type ParsedLayers = Map<string, unknown[]>;

/** 読み飛ばしたマーカーの数 (ログ用) */
export interface SkipCounter {
    skipped: number;
}

/** markers.json 全体を緩く検証し、レイヤー ID ごとのマーカーにする */
export const parseMarkerLayers = (json: unknown): ParsedLayers => {
    const layers: ParsedLayers = new Map();
    if (!Array.isArray(json)) {
        return layers;
    }
    for (const item of json) {
        const layer = layerSchema.safeParse(item);
        if (layer.success) {
            layers.set(layer.data.id, layer.data.markers);
        }
    }
    return layers;
};

/** マーカーのうち、スキーマに合うものだけを取り出す。合わないものは数える */
const pick = <T>(
    markers: unknown[] | undefined,
    schema: z.ZodType<T>,
    counter: SkipCounter,
): T[] => {
    const picked: T[] = [];
    for (const marker of markers ?? []) {
        const result = schema.safeParse(marker);
        if (result.success) {
            picked.push(result.data);
        } else {
            counter.skipped += 1;
        }
    }
    return picked;
};

/**
 * 一直線上に並んだ途中の頂点を落とす (見た目は変わらない)。
 * squaremap の路線は 2 ブロックおきに頂点を持つことが多く、ここで大きく減る
 */
export const simplifyPoints = (points: z.infer<typeof vec2Schema>[]) => {
    const simplified: PointTuple[] = [];
    for (const { x, z } of points) {
        const last = simplified[simplified.length - 1];
        const prev = simplified[simplified.length - 2];
        // 直前の頂点と同じ位置なら足さない
        if (last && last[0] === x && last[1] === z) {
            continue;
        }
        // 前の 2 点と同じ直線上で、同じ向きに進んでいるなら、直前の頂点を置き換える
        if (last && prev) {
            const cross =
                (last[0] - prev[0]) * (z - prev[1]) -
                (last[1] - prev[1]) * (x - prev[0]);
            const dot =
                (last[0] - prev[0]) * (x - last[0]) +
                (last[1] - prev[1]) * (z - last[1]);
            if (cross === 0 && dot > 0) {
                simplified[simplified.length - 1] = [x, z];
                continue;
            }
        }
        simplified.push([x, z]);
    }
    return simplified;
};

/** 線の色。squaremap は color と fillColor のどちらかに入れる */
const lineColor = (line: Polyline) => line.color ?? line.fillColor ?? "";

/** マーカーの type (検証前に種類で振り分けるため) */
const markerType = (marker: unknown): unknown =>
    typeof marker === "object" && marker !== null && "type" in marker
        ? marker.type
        : undefined;

/** スポーン地点・バナーのアイコンをピンにする */
const toPins = (markers: unknown[] | undefined, counter: SkipCounter) =>
    pick(markers, iconSchema, counter).map((icon): MapPinData => ({
        point: icon.point,
        label: stripMarkerHtml(icon.tooltip ?? ""),
    }));

/** 保護範囲以外のレイヤーを、/map で使う項目だけに詰める */
export const compactBaseMarkers = (
    layers: ParsedLayers,
    counter: SkipCounter,
): CompactBaseMarkers => {
    const railway = layers.get(LAYER_IDS.railway);
    // 鉄道レイヤーは円 (駅) と折れ線 (路線) が混ざっているので、種類で分けてから検証する
    const railwayCircles = pick(
        railway?.filter((marker) => markerType(marker) === "circle"),
        circleSchema,
        counter,
    ).map((circle): RailwayCircle => {
        const popup = circle.popup ?? "";
        return {
            center: circle.center,
            radius: circle.radius,
            name: parseStationName(popup),
            numberings: parseStationNumberings(popup),
        };
    });
    const railwayLines = pick(
        railway?.filter((marker) => markerType(marker) === "polyline"),
        polylineSchema,
        counter,
    ).map((line): RailwayLine => ({
        points: simplifyPoints(line.points),
        color: lineColor(line),
        route: parseRailwayPopup(line.popup ?? ""),
    }));
    const worldBorder = pick(
        layers.get(LAYER_IDS.worldBorder),
        polylineSchema,
        counter,
    ).map((line): BorderLine => ({
        points: simplifyPoints(line.points),
        color: lineColor(line),
    }));
    return {
        railwayLines,
        railwayCircles,
        // 札の色の推定は全駅 × 全路線の距離を見るので、クライアントではなくここで 1 回だけ行う
        numberingColors: buildNumberingColors(railwayCircles, railwayLines),
        worldBorder,
        spawn: toPins(layers.get(LAYER_IDS.spawn), counter),
        banners: toPins(layers.get(LAYER_IDS.banners), counter),
    };
};

/** 保護範囲を、名前を辞書にした組の配列に詰める */
export const compactClaims = (
    layers: ParsedLayers,
    counter: SkipCounter,
): CompactClaims => {
    const names: string[] = [];
    const nameIndex = new Map<string, number>();
    // 名前を辞書の番号にする。初めて出た名前は辞書に足す
    const indexOf = (name: string) => {
        let index = nameIndex.get(name);
        if (index === undefined) {
            index = names.length;
            names.push(name);
            nameIndex.set(name, index);
        }
        return index;
    };
    const rectangles = pick(
        layers.get(LAYER_IDS.claims),
        rectangleSchema,
        counter,
    );
    const claims = rectangles.map((rectangle): CompactClaim => {
        const info = parseClaimPopup(rectangle.popup ?? "");
        const [a, b] = rectangle.points;
        const trustLists = [
            info.permissionTrust,
            info.trust,
            info.containerTrust,
            info.accessTrust,
        ].map((list) => list.map(indexOf));
        // 信頼リストは空のことが多いので、末尾の空を省いて小さくする
        let length = trustLists.length;
        while (length > 0 && trustLists[length - 1].length === 0) {
            length -= 1;
        }
        return [
            a.x,
            a.z,
            b.x,
            b.z,
            indexOf(info.owner),
            info.isAdmin ? 1 : 0,
            ...trustLists.slice(0, length),
        ] as CompactClaim;
    });
    return { names, claims };
};
