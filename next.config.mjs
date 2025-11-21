/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compress: true, // Enable gzip compression
  
  // Optimize images (if any are added later)
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@react-three/fiber', '@react-three/drei'],
  },
  
  // Webpack optimizations - only in production
  webpack: (config, { isServer, dev }) => {
    // Only apply optimizations in production build
    if (!isServer && !dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'async',
          cacheGroups: {
            // Keep default Next.js optimizations
            ...config.optimization?.splitChunks?.cacheGroups,
            // Add specific chunk for three.js (heavy library)
            three: {
              name: 'three',
              test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
