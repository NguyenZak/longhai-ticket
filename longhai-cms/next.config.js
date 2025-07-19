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
            'via.placeholder.com',
            'res.cloudinary.com',
        ],
    },
};

module.exports = nextConfig;
