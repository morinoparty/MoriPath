"use client";

import { MinecraftProvider } from "@morinoparty/chlorophyll-react/components";
import { useMemo } from "react";
import { AppToaster } from "../toaster";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";
import { PaletteProvider } from "./palette";

type ProviderProps = ColorModeProviderProps & {
    mcApiUrl: string;
    /** mc-assets の minecraft 名前空間のベース URL。MinecraftItem のモデル・テクスチャをここから読む */
    minecraftAssetsUrl: string;
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

export function Provider({
    mcApiUrl,
    minecraftAssetsUrl,
    ...props
}: ProviderProps) {
    const minecraftConfig = useMemo(
        () => createMinecraftConfig(mcApiUrl),
        [mcApiUrl],
    );
    return (
        <PaletteProvider>
            {/* アバター・スキンは config、アイテムのモデル・テクスチャは assets から解決する */}
            <MinecraftProvider
                assets={minecraftAssetsUrl}
                config={minecraftConfig}
            >
                <ColorModeProvider enableSystem={false} {...props} />
                {/* toast はページをまたいで出すため、ここに 1 つだけ置く */}
                <AppToaster />
            </MinecraftProvider>
        </PaletteProvider>
    );
}
