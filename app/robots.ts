import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.risainterior.in';

  return {
    rules: [
      {
        // 🎯 Priority for Visual Branding (Favicon & OG Image)
        userAgent: ['Googlebot-Image', 'GoogleFavicon'],
        allow: ['/favicon.png', '/opengraph-image'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',      
          '/admin/logs',  
          '/admin/settings',
          '/api/',        
          '/_next/',      
          '/private/',    
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}