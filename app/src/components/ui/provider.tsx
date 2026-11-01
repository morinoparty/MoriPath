"use client";

import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import { useMemo } from "react";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";
import { PaletteProvider } from "./palette";

type ProviderProps = ColorModeProviderProps & {
    mcApiUrl: string;
};

// プレイヤー画像を chlorophyll 既定の取得先ではなくプレイヤー API から取得する
function createMinecraftConfig(mcApiUrl: string) {
    const player = (playerId: string) =>
        `${mcApiUrl}/v1/players/${encodeURIComponent(playerId)}`;
    return {
        avatarUrl: (playerId: string, pixelSize: number) =>
            `${player(playerId)}/avatar?size=${pixelSize}`,
        skinUrl: (playerId: string) => `${player(playerId)}/skin`,
    };
}

export function Provider({ mcApiUrl, ...props }: ProviderProps) {
    const minecraftConfig = useMemo(
        () => createMinecraftConfig(mcApiUrl),
        [mcApiUrl],
    );
    return (
        <PaletteProvider>
            <MinecraftProvider config={minecraftConfig}>
                <ColorModeProvider enableSystem={false} {...props} />
            </MinecraftProvider>
        </PaletteProvider>
    );
}
