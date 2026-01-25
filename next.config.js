/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
});

const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'static.fokusistatistik.com',
            },
            {
                protocol: 'https',
                hostname: 'cdn.freesound.org',
            },
        ],
    },
};

module.exports = withPWA(nextConfig);
