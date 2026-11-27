import type { Town, TownSlug } from "../-types/town";

/** 街の画像の配信元 (公開アセットなので定数で持つ) */
export const TOWN_ASSETS_ORIGIN = "https://assets.morinoparty.workers.dev";

/**
 * 写真を出すのはこの駅だけ。AdvanceRailway の駅 slug → 街。
 * API に街の情報は無いので手で管理する。slug は大文字・小文字を区別する
 */
export const townSlugByStationSlug: Readonly<Record<string, TownSlug>> = {
    mrmt: "morimoto",
    ummt: "umimoto",
    kmmr: "kamimori",
    sekk: "sekkakyo",
    // あつもり環状線の N1 (MA02) 駅
    atmn: "atsumori",
};

// 文字ロゴは高さ 220 で書き出されている
const LOGO_HEIGHT = 220;

// 街の表示名と文字ロゴの幅 (manifest.json の width)
const townSources: Readonly<
    Record<TownSlug, { label: string; logoWidth: number }>
> = {
    morimoto: { label: "もりもと", logoWidth: 428 },
    umimoto: { label: "うみもと", logoWidth: 428 },
    kamimori: { label: "神森", logoWidth: 440 },
    sekkakyo: { label: "雪華郷", logoWidth: 418 },
    atsumori: { label: "あつもり", logoWidth: 428 },
};

// city/<街>/<街>.webp と city/<街>/<街>-text.webp の決まった名前で置かれている
const buildTown = (slug: TownSlug): Town => ({
    slug,
    label: townSources[slug].label,
    photoUrl: `${TOWN_ASSETS_ORIGIN}/city/${slug}/${slug}.webp`,
    logoUrl: `${TOWN_ASSETS_ORIGIN}/city/${slug}/${slug}-text.webp`,
    logoAspect: townSources[slug].logoWidth / LOGO_HEIGHT,
});

/** 街ごとの表示名と画像 */
export const towns: Readonly<Record<TownSlug, Town>> = {
    morimoto: buildTown("morimoto"),
    umimoto: buildTown("umimoto"),
    kamimori: buildTown("kamimori"),
    sekkakyo: buildTown("sekkakyo"),
    atsumori: buildTown("atsumori"),
};
