//Importação das configurações do next

/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, max-age=0',
            },
          ],
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
