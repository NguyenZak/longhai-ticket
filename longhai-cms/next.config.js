/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        domains: [
            'localhost',
            'images.unsplash.com',
            'res.cloudinary.com',
        ],
    },
};

module.exports = nextConfig;
