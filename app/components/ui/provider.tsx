"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import { system } from "../../../theme";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";

export function Provider(props: ColorModeProviderProps) {
    return (
        <ThemeProvider enableSystem={false}>
            <ChakraProvider value={system}>
                <ColorModeProvider {...props} />
            </ChakraProvider>
        </ThemeProvider>
    );
}
