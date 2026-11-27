/** 写真とロゴがある街 (assets の city/<slug>/ と同じ名前) */
export type TownSlug =
    | "morimoto"
    | "umimoto"
    | "kamimori"
    | "sekkakyo"
    | "atsumori";

/** 乗換案内で写真とロゴを出す街 */
export interface Town {
    slug: TownSlug;
    /** 表示名 (もりもと / うみもと / 神森 / 雪華郷 / あつもり) */
    label: string;
    /** 街の写真 (1920×1080 webp) */
    photoUrl: string;
    /** キャッチコピー入りの文字ロゴ (高さ 220 の webp) */
    logoUrl: string;
    /** 文字ロゴの縦横比 (幅 / 高さ)。img の width/height に使い、読み込み中のずれを防ぐ */
    logoAspect: number;
}
