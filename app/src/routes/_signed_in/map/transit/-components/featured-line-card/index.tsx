import { sva } from "../../../../../../../styled-system/css";
import type { Town } from "../../-types/town";
import type { LineSummary } from "../../-types/transit";
import { LineRow } from "../line-row";

const featuredLineCardStyle = sva({
    slots: ["root", "banner", "photoBox", "photo", "label"],
    base: {
        // 出発駅を通るいちばん上の路線を、両端の街の写真つきで大きく見せる
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            paddingTop: "8px",
            paddingX: "8px",
            borderRadius: "28px",
            bg: "colorPalette.surface.subtle",
        },
        banner: {
            display: "flex",
            cursor: "pointer",
            gap: "4px",
            height: "80px",
        },
        photoBox: {
            position: "relative",
            flex: "1",
            minWidth: "0",
            overflow: "hidden",
            // 左右の写真で外側の角だけを大きく丸める
            "&[data-side=left]": { borderRadius: "20px 8px 8px 20px" },
            "&[data-side=right]": { borderRadius: "8px 20px 20px 8px" },
            "&[data-side=both]": { borderRadius: "20px" },
        },
        photo: {
            width: "full",
            height: "full",
            objectFit: "cover",
        },
        // 写真の上に「〇〇方面」を置く。少し透ける面で写真の上でも読めるようにする
        label: {
            position: "absolute",
            bottom: "6px",
            px: "10px",
            py: "3px",
            borderRadius: "full",
            bg: "color-mix(in srgb, {colors.bg.panel} 92%, transparent)",
            fontSize: "11px",
            fontWeight: "bold",
            lineHeight: "1.4",
            color: "colorPalette.fg",
            whiteSpace: "nowrap",
            "[data-side=left] &, [data-side=both] &": { left: "6px" },
            "[data-side=right] &": { right: "6px" },
        },
    },
});

export interface FeaturedLineCardProps {
    summary: LineSummary;
    /** 端の駅のうち街の駅の街 (始点 → 終点の順、1〜2 つ)。街の駅でない端は入れない */
    towns: Town[];
    onClick: () => void;
}

/**
 * 出発駅を通る路線の特集カード。行のボタンを入れ子にできないため、写真の帯は飾り (読み上げない) として
 * ポインターで押したときだけ同じ操作にし、キーボードと読み上げは行のボタンで扱う
 */
export const FeaturedLineCard = ({
    summary,
    towns,
    onClick,
}: FeaturedLineCardProps) => {
    const style = featuredLineCardStyle();
    const [first, last] = towns;
    // 街が 1 つだけ (片方の端だけ街の駅、または両端が同じ街) なら写真を 1 枚だけ横いっぱいに出す
    const photos =
        !last || first.slug === last.slug
            ? [{ town: first, side: "both" }]
            : [
                  { town: first, side: "left" },
                  { town: last, side: "right" },
              ];
    return (
        <div className={style.root}>
            {}
            <div className={style.banner} aria-hidden onClick={onClick}>
                {photos.map(({ town, side }) => (
                    <div key={side} className={style.photoBox} data-side={side}>
                        <img
                            className={style.photo}
                            src={town.photoUrl}
                            alt=""
                            width={320}
                            height={180}
                            loading="lazy"
                            decoding="async"
                        />
                        <span
                            className={style.label}
                        >{`${town.label}方面`}</span>
                    </div>
                ))}
            </div>
            <LineRow summary={summary} embedded onClick={onClick} />
        </div>
    );
};
