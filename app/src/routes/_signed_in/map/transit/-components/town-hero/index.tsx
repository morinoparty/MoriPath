import { sva } from "../../../../../../../styled-system/css";
import type { Town } from "../../-types/town";

const townHeroStyle = sva({
    slots: ["background", "photo", "fade", "logoBlock", "logo"],
    base: {
        // ページの上に敷く街の写真。中身は上に重ねるので、押せない背景の層にする
        background: {
            position: "absolute",
            top: "0",
            insetX: "0",
            height: "340px",
            zIndex: "0",
            overflow: "hidden",
            pointerEvents: "none",
            transitionProperty: "height",
            transitionDuration: "normal",
            "&[data-compact=true]": { height: "200px" },
        },
        photo: {
            width: "full",
            height: "full",
            objectFit: "cover",
        },
        // 上は見出しが読めるよう、下はページの地の色へ溶けるよう地の色を重ねる。
        // 色はトークンから作り、ダークモードでも地の色へ溶けるようにする
        fade: {
            position: "absolute",
            inset: "0",
            background:
                "linear-gradient(180deg, color-mix(in srgb, {colors.colorPalette.bg} 92%, transparent) 0%, color-mix(in srgb, {colors.colorPalette.bg} 72%, transparent) 27%, transparent 40%, color-mix(in srgb, {colors.colorPalette.bg} 10%, transparent) 73.5%, {colors.colorPalette.bg} 100%)",
        },
        // 写真の上に置く文字ロゴの場所。入力中は写真を細くし、ロゴは出さない
        logoBlock: {
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            height: "170px",
            "&[data-compact=true]": { height: "30px" },
        },
        logo: {
            height: "95px",
            width: "auto",
            maxWidth: "full",
            objectFit: "contain",
            objectPosition: "left bottom",
        },
    },
});

export interface TownHeroProps {
    town: Town;
    /** 検索の入力中は写真を細くしてロゴを隠す */
    compact: boolean;
}

/** ページの上に敷く街の写真 (地の色へ溶けていく) */
export const TownHeroBackground = ({ town, compact }: TownHeroProps) => {
    const style = townHeroStyle();
    return (
        <div className={style.background} data-compact={compact} aria-hidden>
            <img
                // 街が変わったら前の写真を残さず読み直す
                key={town.slug}
                className={style.photo}
                src={town.photoUrl}
                alt=""
                width={1920}
                height={1080}
                fetchPriority="high"
                decoding="async"
            />
            <span className={style.fade} />
        </div>
    );
};

/** 写真の上に置く街の文字ロゴ (キャッチコピー入り) */
export const TownHeroLogo = ({ town, compact }: TownHeroProps) => {
    const style = townHeroStyle();
    return (
        <div className={style.logoBlock} data-compact={compact}>
            {!compact && (
                <img
                    key={town.slug}
                    className={style.logo}
                    src={town.logoUrl}
                    alt={town.label}
                    height={95}
                    width={Math.round(95 * town.logoAspect)}
                    decoding="async"
                />
            )}
        </div>
    );
};
