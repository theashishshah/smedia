import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        domains: [
            "lh3.googleusercontent.com", // for Google avatars
            "ik.imagekit.io", // ✅ add ImageKit domain
        ],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com",
            },

            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
            {
                protocol: "https",
                hostname: "i.pravatar.cc",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
        ],
    },
};

export default nextConfig;
