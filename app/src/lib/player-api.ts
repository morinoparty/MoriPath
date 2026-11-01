import { env } from "cloudflare:workers";

// MC_API_URL の末尾スラッシュの有無を吸収する
export function getMcApiUrl(): string {
    return env.MC_API_URL.replace(/\/+$/, "");
}
