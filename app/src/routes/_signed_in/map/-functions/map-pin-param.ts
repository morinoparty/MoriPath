import {
    type MapPinTarget,
    type MapPinType,
    mapPinTypes,
} from "../-types/map-pin-target";
import type { WorldId } from "../-types/world-map";

/** 座標の上限 (Minecraft のワールドの端と同じ ±30,000,000) */
export const MAP_COORD_LIMIT = 30_000_000;

/** ピンに添える名前の最大文字数。長い名前で URL とカードが伸びないようにする */
export const MAP_PIN_LABEL_MAX = 40;

// pin=<種類>:<x>,<z> (例: shop:120,-340)。座標は整数のブロック座標
const pinPattern = /^([a-z]+):(-?\d+),(-?\d+)$/;

const isMapPinType = (value: string): value is MapPinType =>
    (mapPinTypes as readonly string[]).includes(value);

const isInWorld = (value: number) =>
    Number.isSafeInteger(value) && Math.abs(value) <= MAP_COORD_LIMIT;

/** pin パラメータを読む。形が違う・知らない種類・範囲外なら null */
export const parseMapPin = (value: string): MapPinTarget | null => {
    const match = pinPattern.exec(value);
    if (!match) return null;
    const [, type, rawX, rawZ] = match;
    const x = Number(rawX);
    const z = Number(rawZ);
    if (!isMapPinType(type) || !isInWorld(x) || !isInWorld(z)) return null;
    return { type, x, z };
};

/** pin パラメータの文字列を作る。小数の座標はそのブロック (切り捨て) を指す */
export const formatMapPin = ({ type, x, z }: MapPinTarget): string =>
    `${type}:${Math.floor(x)},${Math.floor(z)}`;

/** ピンの名前をそろえる。前後の空白を除き、長すぎれば切り、空なら無しにする */
export const normalizeMapPinLabel = (value: string): string | undefined => {
    const label = value.trim().slice(0, MAP_PIN_LABEL_MAX);
    return label === "" ? undefined : label;
};

/** 他の画面から /map のピンへ飛ぶリンクの search (Link の search にそのまま渡す) */
export const mapPinSearch = ({
    world,
    label,
    ...target
}: MapPinTarget & { world: WorldId; label?: string }) => ({
    world,
    pin: formatMapPin(target),
    label: label === undefined ? undefined : normalizeMapPinLabel(label),
});
