import { IconButton } from "@morinoparty/chlorophyll-react/components";
import { Link } from "@tanstack/react-router";
import { CornerUpRight } from "lucide-react";
import { css } from "../../../../../../styled-system/css";

const transitButtonStyle = css({
    // 地図の右下に浮かぶ丸いボタン。ブランド色の面 + 影で、ほかのクロムより目立たせる
    width: "56px",
    height: "56px",
    boxShadow: "chrome",
    // 森や草原のタイルは緑が多く、ブランド色の面だけだと地図に溶けるため、白い縁で地図から切り離す
    outline: "3px solid {colors.bg.panel}",
    "& svg": {
        width: "26px",
        height: "26px",
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
