import type { NextConfig } from "next";

// initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "crafthead.net",
                port: "",
                pathname: "/avatar/**",
            }
        ],

    },
    rewrites: async () => {
        return [
            {
                source: "/main/:path*",
                destination: process.env.MAIN_SERVER_URL + "/:path*",
            },

        ];
    }
};

export default nextConfig;
