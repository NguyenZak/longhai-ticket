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

module.exports = {
  ...nextConfig,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: { and: [/[jt]sx?$/] },
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            icon: true,
            svgo: true,
            svgoConfig: {
              plugins: [
                { name: 'removeViewBox', active: false },
              ],
            },
          },
        },
      ],
    });
    return config;
  },
};
