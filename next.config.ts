import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import type { NextConfig } from "next";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "crafthead.net",
                port: "",
                pathname: "/avatar/**",
            },
            {
                protocol: "https",
                hostname: "minotar.net",
                port: "",
                pathname: "/helm/**",
            },
        ],
    },
};

export default nextConfig;
