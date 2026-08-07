"use client";

import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";
import { PaletteProvider } from "./palette";

// プレイヤー画像は従来どおり crafthead.net から取得する
// (chlorophyll の既定は mc-heads.net)
const minecraftConfig = {
    avatarUrl: (playerId: string, pixelSize: number) =>
        `https://crafthead.net/avatar/${playerId}/${pixelSize}`,
    skinUrl: (playerId: string) => `https://crafthead.net/skin/${playerId}`,
};

export function Provider(props: ColorModeProviderProps) {
    return (
        <PaletteProvider>
            <MinecraftProvider config={minecraftConfig}>
                <ColorModeProvider enableSystem={false} {...props} />
            </MinecraftProvider>
        </PaletteProvider>
    );
}
