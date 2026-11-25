import { env } from "cloudflare:workers";

/**
 * mc-assets の minecraft 名前空間のベース URL (末尾スラッシュなし)。
 * 配下は本家リソースパックと同じ models/ textures/ items/ lang/ 構成になっている
 */
export function getMinecraftAssetsUrl(): string {
    // MC_ASSETS_URL の末尾スラッシュの有無を吸収する
    const origin = env.MC_ASSETS_URL.replace(/\/+$/, "");
    return `${origin}/assets/minecraft`;
}
