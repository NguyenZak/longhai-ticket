/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    esmExternals: 'loose',
  },
  images: {
    domains: [
      'localhost',
      'images.unsplash.com',
      'res.cloudinary.com',
    ],
  },
  webpack: (config, { dev, isServer }) => {
    // Fix webpack chunks issue - only on client build
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }

    // SVG loader
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

module.exports = nextConfig;
