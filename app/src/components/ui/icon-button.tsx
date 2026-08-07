"use client";

import { ark, type HTMLArkProps } from "@ark-ui/react/factory";
import * as React from "react";
import { css, cx } from "../../../styled-system/css";

// アイコンだけを載せる正方形のゴーストボタン。
// Chakra の IconButton (variant="ghost", size="sm") の置き換え
const iconButtonClass = css({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "9",
    height: "9",
    flexShrink: 0,
    borderRadius: "md",
    border: "none",
    background: "transparent",
    color: "colorPalette.fg",
    cursor: "pointer",
    transition: "background 0.15s",
    _hover: {
        background: "colorPalette.a4",
    },
    "& svg": {
        width: "5",
        height: "5",
    },
});

export interface IconButtonProps extends HTMLArkProps<"button"> {
    "aria-label": string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
    function IconButton({ className, ...props }, ref) {
        return (
            <ark.button
                type="button"
                ref={ref}
                {...props}
                className={cx(iconButtonClass, className)}
            />
        );
    },
);
