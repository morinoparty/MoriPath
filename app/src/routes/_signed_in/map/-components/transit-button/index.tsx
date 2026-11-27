import { IconButton } from "@morinoparty/chlorophyll-react/components";
import { Link } from "@tanstack/react-router";
import { CornerUpRight } from "lucide-react";
import { css } from "../../../../../../styled-system/css";

const transitButtonStyle = css({
    // 地図の右下に浮かぶ丸いボタン (Figma で決めた 44px・アイコン 20px)。
    // ほかのクロムより一回り小さくして地図を隠しすぎず、ブランド色の面 + 影で見つけやすくする
    width: "44px",
    height: "44px",
    minWidth: "44px",
    boxShadow: "chrome",
    // 森や草原のタイルは緑が多く、ブランド色の面だけだと地図に溶けるため、白い縁で地図から切り離す。
    // 縁の太さも 56px のときの 3px からボタンの大きさに合わせて縮める
    outline: "2px solid {colors.bg.panel}",
    "& svg": {
        width: "20px",
        height: "20px",
    },
});

/** 地図の右下から乗換案内のページへ移るボタン */
export const TransitButton = () => (
    <IconButton
        asChild
        variant="solid"
        shape="circle"
        size="lg"
        className={transitButtonStyle}
        aria-label="乗換案内"
    >
        <Link to="/map/transit">
            {/* 道案内の矢印 (右に曲がる) で、行き方を調べるページだと伝える */}
            <CornerUpRight aria-hidden />
        </Link>
    </IconButton>
);
