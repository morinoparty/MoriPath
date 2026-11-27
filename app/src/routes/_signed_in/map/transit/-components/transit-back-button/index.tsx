import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { sva } from "../../../../../../../styled-system/css";

// ほかの下層ページ (SubPageBar) と同じく、検索条件を付けずに /map へ戻る (ワールドなどは /map の既定に任せる)。
// 型付きの "/map" だと既定値のある world まで必須になるので、行き先は string として渡す
const BACK_TO = "/map" as string;

const transitBackButtonStyle = sva({
    slots: ["root", "pill", "icon", "label", "title"],
    base: {
        // 上部バーの行を持たず、見出しの背景の左上 (安全領域の 12px 下) に浮かべる
        root: {
            position: "absolute",
            top: "calc(env(safe-area-inset-top) + 12px)",
            left: "4",
            zIndex: 2,
        },
        // 「< マップ」のピル。写真・地図・風景のどれの上でも読めるよう、半透明の面とぼかしを敷く。
        // 面の色は下の枠 (出発・到着) と同じにする
        pill: {
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5",
            height: "9",
            paddingLeft: "2",
            paddingRight: "3.5",
            borderRadius: "full",
            bg: "color-mix(in srgb, {colors.colorPalette.surface.subtle} 82%, transparent)",
            backdropFilter: "blur(12px)",
            color: "colorPalette.fg",
            transitionProperty: "background",
            transitionDuration: "fast",
            _hover: {
                bg: "color-mix(in srgb, {colors.colorPalette.surface.subtle} 94%, transparent)",
            },
            // ピルの形に合わせて輪を出す (グローバルの角丸 md を上書きする)
            _focusVisible: { borderRadius: "full" },
        },
        icon: {
            width: "20px",
            height: "20px",
        },
        label: {
            fontSize: "14px",
            fontWeight: "bold",
            lineHeight: "1",
        },
        // ページの見出しは読み上げ用に残し、写真の上には出さない
        title: {
            srOnly: true,
        },
    },
});

/** 乗換案内の左上に浮かぶ、地図へ戻るピル (「< マップ」) と、読み上げ用のページの見出し */
export const TransitBackButton = () => {
    const style = transitBackButtonStyle();
    return (
        <header className={style.root}>
            <Link
                to={BACK_TO}
                className={style.pill}
                // 見た目の「マップ」だけだと地図を開くのか戻るのか分からないので、読み上げでは戻ると伝える
                aria-label="マップにもどる"
            >
                <ChevronLeft className={style.icon} aria-hidden />
                <span className={style.label} aria-hidden>
                    マップ
                </span>
            </Link>
            <h1 className={style.title}>乗換案内</h1>
        </header>
    );
};
