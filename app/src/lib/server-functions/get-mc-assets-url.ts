import { createServerFn } from "@tanstack/react-start";
import { getMinecraftAssetsUrl } from "../mc-assets";

// アイテムのモデル・テクスチャの URL 組み立て用に mc-assets のベース URL をクライアントへ渡す
export const getMinecraftAssetsUrlFn = createServerFn().handler(async () =>
    getMinecraftAssetsUrl(),
);
