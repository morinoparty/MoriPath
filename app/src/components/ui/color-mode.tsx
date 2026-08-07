"use client";

import { Moon, Sun } from "lucide-react";
import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider, useTheme } from "next-themes";
import * as React from "react";
import { IconButton, type IconButtonProps } from "./icon-button";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ColorModeProviderProps extends ThemeProviderProps {}

export function ColorModeProvider(props: ColorModeProviderProps) {
    return (
        <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
    );
}

export type ColorMode = "light" | "dark";

export interface UseColorModeReturn {
    colorMode: ColorMode;
    setColorMode: (colorMode: ColorMode) => void;
    toggleColorMode: () => void;
}

export function useColorMode(): UseColorModeReturn {
    const { resolvedTheme, setTheme } = useTheme();
    const toggleColorMode = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };
    return {
        colorMode: resolvedTheme as ColorMode,
        setColorMode: setTheme,
        toggleColorMode,
    };
}

export function useColorModeValue<T>(light: T, dark: T) {
    const { colorMode } = useColorMode();
    return colorMode === "dark" ? dark : light;
}

export function ColorModeIcon() {
    const { colorMode } = useColorMode();
    return colorMode === "dark" ? <Moon /> : <Sun />;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ColorModeButtonProps extends Omit<IconButtonProps, "aria-label"> {}

export const ColorModeButton = React.forwardRef<
    HTMLButtonElement,
    ColorModeButtonProps
>(function ColorModeButton(props, ref) {
    const { toggleColorMode } = useColorMode();
    return (
        <IconButton
            onClick={toggleColorMode}
            aria-label="Toggle color mode"
            ref={ref}
            {...props}
        >
            <ColorModeIcon />
        </IconButton>
    );
});
