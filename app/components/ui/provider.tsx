"use client";

import { ChakraProvider, Span } from "@chakra-ui/react";
import { system } from "../../../theme";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";
import { PaletteProvider, usePalette } from "./palette";

function PaletteWrapper(props: ColorModeProviderProps) {
    const { palette } = usePalette();
    return (
        <Span display="contents" colorPalette={palette}>
            <ColorModeProvider {...props} />
        </Span>
    );
}

export function Provider(props: ColorModeProviderProps) {
    return (
        <PaletteProvider>
            <ChakraProvider value={system}>
                <PaletteWrapper {...props} />
            </ChakraProvider>
        </PaletteProvider>
    );
}
