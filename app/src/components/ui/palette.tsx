"use client";

import type { IconButtonProps } from "@chakra-ui/react";
import { ClientOnly, IconButton, Skeleton } from "@chakra-ui/react";
import { Leaf, Waves } from "lucide-react";
import * as React from "react";

export type Palette = "mori" | "umi";

interface PaletteContextType {
    palette: Palette;
    setPalette: (palette: Palette) => void;
    togglePalette: () => void;
}

const PaletteContext = React.createContext<PaletteContextType | undefined>(
    undefined,
);

const STORAGE_KEY = "palette";
const DEFAULT_PALETTE: Palette = "mori";

export interface PaletteProviderProps {
    children: React.ReactNode;
}

export function PaletteProvider({ children }: PaletteProviderProps) {
    const [palette, setPaletteState] = React.useState<Palette>(DEFAULT_PALETTE);

    React.useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as Palette | null;
        if (stored === "mori" || stored === "umi") {
            setPaletteState(stored);
            document.documentElement.setAttribute("data-color-palette", stored);
        } else {
            document.documentElement.setAttribute(
                "data-color-palette",
                DEFAULT_PALETTE,
            );
        }
    }, []);

    const setPalette = React.useCallback((newPalette: Palette) => {
        setPaletteState(newPalette);
        localStorage.setItem(STORAGE_KEY, newPalette);
        document.documentElement.setAttribute("data-color-palette", newPalette);
    }, []);

    const togglePalette = React.useCallback(() => {
        setPalette(palette === "umi" ? "mori" : "umi");
    }, [palette, setPalette]);

    const value = React.useMemo(
        () => ({
            palette,
            setPalette,
            togglePalette,
        }),
        [palette, setPalette, togglePalette],
    );

    return (
        <PaletteContext.Provider value={value}>
            {children}
        </PaletteContext.Provider>
    );
}

export interface UsePaletteReturn {
    palette: Palette;
    setPalette: (palette: Palette) => void;
    togglePalette: () => void;
}

export function usePalette(): UsePaletteReturn {
    const context = React.useContext(PaletteContext);
    if (context === undefined) {
        throw new Error("usePalette must be used within a PaletteProvider");
    }
    return context;
}

export function PaletteIcon() {
    const { palette } = usePalette();
    return palette === "umi" ? <Waves /> : <Leaf />;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface PaletteButtonProps extends Omit<IconButtonProps, "aria-label"> {}

export const PaletteButton = React.forwardRef<
    HTMLButtonElement,
    PaletteButtonProps
>(function PaletteButton(props, ref) {
    const { togglePalette } = usePalette();
    return (
        <ClientOnly fallback={<Skeleton boxSize="8" />}>
            <IconButton
                onClick={togglePalette}
                variant="ghost"
                aria-label="Toggle palette"
                size="sm"
                ref={ref}
                {...props}
                css={{
                    _icon: {
                        width: "5",
                        height: "5",
                    },
                }}
            >
                <PaletteIcon />
            </IconButton>
        </ClientOnly>
    );
});
