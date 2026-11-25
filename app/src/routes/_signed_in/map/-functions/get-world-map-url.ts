import { createServerFn } from "@tanstack/react-start";
import { getWorldMapUrl } from "../../../../lib/world-map-api";

// タイル・マーカー・プレイヤー位置の取得元をクライアントへ渡す (URL はソースに書かない)
export const getWorldMapUrlFn = createServerFn().handler(async () =>
    getWorldMapUrl(),
);
