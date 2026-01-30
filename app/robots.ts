import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.risainterior.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',       // 🛡️ Hide main dashboard
          '/admin/logs',  // 🛡️ Explicitly hide protocol archive
          '/admin/settings',
          '/api/',        // 🛡️ Hide backend logic
          '/_next/',      // 🛡️ Hide build files
          '/private/',    
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}