/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compress: true, // Enable gzip compression

  // Redirects for renamed routes
  async redirects() {
    return [
      // Overdracht → Verpleegrapportage
      {
        source: '/epd/overdracht',
        destination: '/epd/verpleegrapportage',
        permanent: true,
      },
      {
        source: '/epd/overdracht/:patientId',
        destination: '/epd/verpleegrapportage?patient=:patientId',
        permanent: true,
      },
      // Dagregistratie → Zorgnotities
      {
        source: '/epd/dagregistratie',
        destination: '/epd/verpleegrapportage/zorgnotities',
        permanent: true,
      },
      {
        source: '/epd/dagregistratie/:patientId',
        destination: '/epd/verpleegrapportage/zorgnotities/:patientId',
        permanent: true,
      },
    ];
  },

  // Optimize images (if any are added later)
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ]
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

    // Avoid serializing very large strings into webpack's filesystem cache during production builds
    if (!dev) {
      config.cache = { type: 'memory' };
    }
    return config;
  },
};

export default nextConfig;
