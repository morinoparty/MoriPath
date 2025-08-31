import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "crafthead.net",
                port: "",
                pathname: "/avatar/**",
            },
        ],
    },
    rewrites: async () => {
        return [
            {
                source: "/main/:path*",
                destination: `${process.env.MAIN_SERVER_URL}/:path*`,
            },
        ];
    },
    experimental: {
        optimizePackageImports: ["@chakra-ui/react"],
    },
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();
