import type { HTMLAttributes } from "react";
import { css, cx } from "../../../../../../styled-system/css";

const mapPopupCardStyle = css({
    // 地図の上に浮かぶクロムなので、枠線ではなく白い面 + 影で持ち上げる
    width: "max-content",
    minWidth: "200px",
    maxWidth: "min(280px, calc(100vw - 64px))",
    p: "4",
    bg: "bg.panel",
    color: "fg",
    borderRadius: "panel",
    boxShadow: "chrome",
    textStyle: "body",
    fontSize: "sm",
});

/** 地図のポップアップの白いカード */
export const MapPopupCard = ({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) => (
    <div {...props} className={cx(mapPopupCardStyle, className)} />
);
