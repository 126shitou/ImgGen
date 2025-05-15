import createNextIntlPlugin from 'next-intl/plugin';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin();

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 优化图片配置
  images: { 
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
  },

  // 优化构建配置
  webpack: (config, { dev, isServer }) => {
    // 生产环境优化
    if (!dev && !isServer) {
      // 优化分包策略
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },

  // 压缩配置
  compress: true,

  // 生产环境优化
  productionBrowserSourceMaps: false,

  async rewrites() {
    return [
      {
        source: '/api/replicate/:path*',
        destination: 'https://api.replicate.com/:path*'
      }
    ];
  }
};

export default bundleAnalyzer(withNextIntl(nextConfig));