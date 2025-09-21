
/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    // Required by pdfjs-dist
    config.externals.push('canvas');

    // Copy the pdf.worker.min.js file to the public directory
    config.resolve.alias['pdfjs-dist/build/pdf.worker.min.js'] = require.resolve(
      'pdfjs-dist/build/pdf.worker.min.js'
    );

    return config;
  },
};

module.exports = nextConfig;
