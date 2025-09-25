/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Cloudflare Pages 지원을 위한 설정
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  // PWA 설정 - static export에서는 headers가 지원되지 않음
  // async headers() {
  //   return [
  //     {
  //       source: '/manifest.json',
  //       headers: [
  //         {
  //           key: 'Content-Type',
  //           value: 'application/manifest+json',
  //         },
  //       ],
  //     },
  //     {
  //       source: '/sw.js',
  //       headers: [
  //         {
  //           key: 'Content-Type',
  //           value: 'application/javascript',
  //         },
  //         {
  //           key: 'Service-Worker-Allowed',
  //           value: '/',
  //         },
  //       ],
  //     },
  //   ]
  // },
  webpack: (config, { dev, isServer }) => {
    // webpack 모듈 로딩 이슈 해결
    if (dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            enforce: true,
            priority: 1,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: 2,
            enforce: true,
          },
        },
      };
    }
    
    // 모듈 해결 방식 개선
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
  // 실험적 기능들 비활성화
  experimental: {
    optimizeCss: false,
  },
}

export default nextConfig
