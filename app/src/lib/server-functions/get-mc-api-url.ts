import { createServerFn } from "@tanstack/react-start";
import { getMcApiUrl } from "../player-api";

// プレイヤー画像の URL 組み立て用に MC_API_URL をクライアントへ渡す
export const getMcApiUrlFn = createServerFn().handler(async () =>
    getMcApiUrl(),
);
