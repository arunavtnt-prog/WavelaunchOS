/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002',
    CRM_API_URL: process.env.CRM_API_URL || 'http://localhost:3000',
    BLUEPRINT_ENGINE_URL: process.env.BLUEPRINT_ENGINE_URL || 'http://localhost:3010',
  },
  rewrites: async () => {
    return [
      {
        source: '/api/proxy/crm/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
      {
        source: '/api/proxy/blueprint-engine/:path*',
        destination: 'http://localhost:3010/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
