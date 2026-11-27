import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { sva } from "../../../../../../../styled-system/css";
import type { TransitHero } from "../../-types/transit-hero";
import { BlockLandscape } from "../block-landscape";

// Leaflet は SSR で読み込めないため、地図はクライアントでだけ遅延読み込みする (読み込むまでは空のグラデーションを見せる)
const StationHeroMap = lazy(() => import("../station-hero-map"));

// 見出し (ロゴ・駅名・あいさつ) の場所の高さ。背景の高さもここから決める。
// 写真を主役にするため、画面の高さの半分ほどを背景に使い (874px の画面で約 470px)、低い画面ほど縮める。
// アドレスバーの出入りで写真が伸び縮みしないよう、いちばん小さい画面の高さ (svh) を基準にする。
// Panda は静的に読み取るので、値は関数ではなく定数の文字列で組み立てる
const HEADLINE_HEIGHT = "clamp(180px, calc(58svh - 160px), 360px)";
// 背の低い画面 (501〜700px) では上の動かない部分が一覧を圧迫しないよう、さらに低くする
const SHORT_HEADLINE_HEIGHT = "clamp(140px, calc(54svh - 160px), 220px)";
// 入力中は戻るボタンの下にすぐ枠が来る高さにし、一覧を広く見せる
const COMPACT_HEADLINE_HEIGHT = "52px";

// 背景は見出しの下の枠 (出発・到着) の上の方まで伸ばし、写真や地図に枠を重ねる。
// 124px = 上の余白 16px + 見出しと枠の間 14px + 枠に重なる 94px (Figma の 470 - 376)
const HERO_HEIGHT = `calc(${HEADLINE_HEIGHT} + 124px + env(safe-area-inset-top))`;
const SHORT_HERO_HEIGHT = `calc(${SHORT_HEADLINE_HEIGHT} + 124px + env(safe-area-inset-top))`;
// 入力中は細くする (枠との重なりも少なくする)
const COMPACT_HERO_HEIGHT = "calc(200px + env(safe-area-inset-top))";

// 低い画面の範囲。どちらも高さの上限だけで書くと後勝ちの順序に頼るので、範囲を分けておく
const SHORT_SCREEN = "@media (max-height: 700px) and (min-height: 501px)";
// 横向きのスマホなどとても低い画面 (500px 以下) は、入力中と同じ細い見出しにして一覧の場所を残す
const TINY_SCREEN = "@media (max-height: 500px)";

// 地図の枠は画面の高さ (100svh) にし、駅 (地図の中心) は枠の上から 50svh の位置に来る (svh はアドレスバーの出入りで変わらない)。
// 背景は画面の高さから決まるので、枠も画面の高さに合わせればどの画面でも背景を覆える。
// 駅が戻るボタンと見出しの下端の間 (見出しの場所の真ん中) に来るよう、枠を上へずらす
const MAP_FRAME_HEIGHT = "100svh";
const MAP_TOP = `calc(env(safe-area-inset-top) + 16px + (${HEADLINE_HEIGHT}) / 2 - 50svh)`;
const SHORT_MAP_TOP = `calc(env(safe-area-inset-top) + 16px + (${SHORT_HEADLINE_HEIGHT}) / 2 - 50svh)`;
// 入力中は下に枠が来るので、駅を戻るボタンと同じ高さ (上から 36px) まで上げる
const COMPACT_MAP_TOP = "calc(env(safe-area-inset-top) + 36px - 50svh)";

// 細い背景での風景の置きかた。絵を幅に合わせた縦横比で置き、線路 (絵の y=248) を
// 枠の 16px 上 (上の余白 16 + 見出し 52 + 間 14 - 16 = 66px) にそろえる。
// 背景より大きな絵を上下にずらすので、はみ出た空と地面は背景の枠で切り取られる
const COMPACT_LANDSCAPE = {
    top: "calc(env(safe-area-inset-top) + 66px)",
    bottom: "auto",
    height: "auto",
    aspectRatio: "402 / 470",
    // 自分の高さに対する割合で上へずらす (248 / 470)
    transform: "translateY(-52.766%)",
} as const;

/** 見出しの高さ。full: ふつう / compact: 検索の入力中 */
type HeroSize = "full" | "compact";

const transitHeroStyle = sva({
    slots: [
        "background",
        "sky",
        "landscape",
        "photo",
        "mapFrame",
        "fade",
        "headline",
        "logo",
        "stationName",
        "stationReading",
        "greetingTitle",
        "greetingLead",
    ],
    base: {
        // ページの上に敷く背景。中身は上に重ねるので、押せない背景の層にする
        background: {
            position: "absolute",
            top: "0",
            insetX: "0",
            height: HERO_HEIGHT,
            zIndex: "0",
            overflow: "hidden",
            pointerEvents: "none",
            transitionProperty: "height",
            transitionDuration: "normal",
            [SHORT_SCREEN]: { height: SHORT_HERO_HEIGHT },
            [TINY_SCREEN]: { height: COMPACT_HERO_HEIGHT },
            "&[data-size=compact]": { height: COMPACT_HERO_HEIGHT },
        },
        // どの種類でもいちばん下に敷く、淡い空のグラデーション (上は水色、なかほどで緑がかり、下は地の色)。
        // 写真や地図の読み込み中もこれが見える。色は海・森のパレットのトークンを地の色に混ぜて作る
        sky: {
            position: "absolute",
            inset: "0",
            backgroundImage:
                "linear-gradient(180deg, color-mix(in oklab, {colors.umi.4} 75%, {colors.colorPalette.bg}) 0%, color-mix(in oklab, {colors.mori.3} 70%, {colors.colorPalette.bg}) 45%, {colors.colorPalette.bg} 100%)",
        },
        // 写真も地図も出せないときのブロックの風景。下端 (地面) を背景の下端にそろえる
        landscape: {
            position: "absolute",
            inset: "0",
            // 細い背景で下端にそろえたままだと地面しか見えないので、
            // 線路と電車を戻るピルと枠の間に見せる (はみ出た地面は切り取る)
            [TINY_SCREEN]: COMPACT_LANDSCAPE,
            "[data-size=compact] > &": COMPACT_LANDSCAPE,
        },
        photo: {
            position: "absolute",
            inset: "0",
            width: "full",
            height: "full",
            objectFit: "cover",
        },
        // 地図は高さを変えずに置き、駅 (地図の中心) が戻るボタンと見出しの下端の間に来るよう上へずらす。
        // 背景が細くなっても地図を作り直さず (Leaflet の大きさを変えず)、位置だけ動かして切り抜く。
        // 高さは背景の下端より下まで届くようにし、地図が途中で切れて空との境目が見えないようにする
        mapFrame: {
            position: "absolute",
            insetX: "0",
            top: MAP_TOP,
            height: MAP_FRAME_HEIGHT,
            transitionProperty: "top",
            transitionDuration: "normal",
            [SHORT_SCREEN]: { top: SHORT_MAP_TOP },
            [TINY_SCREEN]: { top: COMPACT_MAP_TOP },
            "[data-size=compact] > &": { top: COMPACT_MAP_TOP },
        },
        // 写真や地図は覆わず、下端まで (枠の後ろまで) そのまま見せる。
        // 上端だけ少し暗くして、ステータスバーと戻るボタンを読みやすくする
        fade: {
            position: "absolute",
            inset: "0",
            background:
                "linear-gradient(180deg, color-mix(in srgb, {colors.black} 28%, transparent) 0%, transparent 18%)",
            // 明るい空の絵は暗くする必要が無いので、何も重ねない
            "[data-kind=landscape] > &": { display: "none" },
        },
        // 背景の上に置く見出し (街の文字ロゴ・駅名・あいさつ)。下端を枠のすぐ上にそろえる。
        // 入力中は背景を細くし、見出しは出さない
        headline: {
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: "1.5",
            height: HEADLINE_HEIGHT,
            transitionProperty: "height",
            transitionDuration: "normal",
            // 上の部分は動かないので、背の低い画面では見出しを低くして一覧の場所を空ける
            [SHORT_SCREEN]: { height: SHORT_HEADLINE_HEIGHT },
            // とても低い画面では入力中と同じく見出しを隠す (ロゴや駅名が戻るピルに重ならないように)
            [TINY_SCREEN]: {
                height: COMPACT_HEADLINE_HEIGHT,
                "& > *": { display: "none" },
            },
            "&[data-size=compact]": { height: COMPACT_HEADLINE_HEIGHT },
        },
        logo: {
            height: "95px",
            width: "auto",
            maxWidth: "full",
            objectFit: "contain",
            objectPosition: "left bottom",
        },
        stationName: {
            fontSize: "32px",
            fontWeight: "bold",
            lineHeight: "1.2",
            color: "colorPalette.fg",
            lineClamp: 2,
            // 風景の絵の上でも読めるよう、地の色のフチ取りの文字にする
            textShadow:
                "0 0 2px {colors.colorPalette.bg}, 0 0 4px {colors.colorPalette.bg}, 0 0 8px {colors.colorPalette.bg}",
        },
        stationReading: {
            fontSize: "14px",
            fontWeight: "bold",
            lineHeight: "1.4",
            color: "fg.muted",
            textShadow:
                "0 0 2px {colors.colorPalette.bg}, 0 0 4px {colors.colorPalette.bg}",
        },
        // 駅を選んでいないときのあいさつ。風景の下の地面の上に、左寄せで大きく出す
        greetingTitle: {
            fontSize: "28px",
            fontWeight: "bold",
            lineHeight: "1.2",
            color: "colorPalette.fg",
        },
        // Figma C4 と同じく、見出しと同じ緑の細い文字にする。
        // 枠との間を Figma どおり 16px にするため、見出しの間 (14px) に 2px 足す
        greetingLead: {
            fontSize: "14px",
            fontWeight: "normal",
            lineHeight: "1.3",
            color: "colorPalette.fg",
            marginBottom: "0.5",
        },
    },
});

export interface TransitHeroProps {
    hero: TransitHero;
    /** 検索の入力中は背景を細くして見出しを隠す */
    compact: boolean;
}

const sizeOf = (compact: boolean): HeroSize => (compact ? "compact" : "full");

/** ページの上に敷く背景 (街の写真・駅の地図・ブロックの風景。下は地の色へ溶けていく) */
export const TransitHeroBackground = ({ hero, compact }: TransitHeroProps) => {
    const style = transitHeroStyle();
    return (
        // 飾りなので読み上げず、中の駅の札 (ボタン) にもフォーカスを入れない
        <div
            className={style.background}
            data-size={sizeOf(compact)}
            data-kind={hero.kind}
            aria-hidden
            inert
        >
            <span className={style.sky} />
            {hero.kind === "landscape" && (
                <BlockLandscape className={style.landscape} />
            )}
            {hero.kind === "town" && (
                <img
                    // 街が変わったら前の写真を残さず読み直す
                    key={hero.town.slug}
                    className={style.photo}
                    src={hero.town.photoUrl}
                    alt=""
                    width={1920}
                    height={1080}
                    fetchPriority="high"
                    decoding="async"
                />
            )}
            {hero.kind === "map" && (
                <div className={style.mapFrame}>
                    <ClientOnly fallback={null}>
                        <Suspense fallback={null}>
                            <StationHeroMap
                                baseUrl={hero.baseUrl}
                                worldId={hero.worldId}
                                station={hero.station}
                            />
                        </Suspense>
                    </ClientOnly>
                </div>
            )}
            <span className={style.fade} />
        </div>
    );
};

export interface TransitHeroHeadlineProps extends TransitHeroProps {
    /**
     * 駅を選んでいないときに「どこへ行きますか？」のあいさつを出すか (既定: 出す)。
     * 駅を選べない案内のページでは出さない
     */
    greeting?: boolean;
}

/** 背景の上に置く見出し。街の駅は文字ロゴ (キャッチコピー入り)、地図を出せない駅は駅名、駅が無ければあいさつ */
export const TransitHeroHeadline = ({
    hero,
    compact,
    greeting = true,
}: TransitHeroHeadlineProps) => {
    const style = transitHeroStyle();
    const content = (() => {
        // 入力中は一覧を広く見せるため、見出しは出さない
        if (compact) return null;
        if (hero.kind === "town") {
            return (
                <img
                    key={hero.town.slug}
                    className={style.logo}
                    src={hero.town.logoUrl}
                    alt={hero.town.label}
                    height={95}
                    width={Math.round(95 * hero.town.logoAspect)}
                    decoding="async"
                />
            );
        }
        // 地図のときは地図の上の駅の札が駅名を示すので (Figma B)、見出しは出さずに地図を広く見せる
        if (hero.kind === "map") return null;
        // 地図も出せない駅は、ブロックの風景の上に駅名を大きく出す
        if (hero.station) {
            return (
                // 駅名は下の枠でも読み上げるので、ここは見た目だけにする
                <div aria-hidden>
                    <p className={style.stationName}>{hero.station.name}</p>
                    {hero.station.reading && (
                        <p className={style.stationReading}>
                            {hero.station.reading}
                        </p>
                    )}
                </div>
            );
        }
        if (!greeting) return null;
        return (
            <>
                <h2 className={style.greetingTitle}>どこへ行きますか？</h2>
                <p className={style.greetingLead}>
                    出発と到着の駅をえらぶと、乗りかえを調べます
                </p>
            </>
        );
    })();
    return (
        <div className={style.headline} data-size={sizeOf(compact)}>
            {content}
        </div>
    );
};
