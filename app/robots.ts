import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.risainterior.in';

  return {
    rules: [
      {
        // 🎯 Priority for Visual Branding (Favicon & OG Image)
        // Ensures your Gold Monogram and Banner appear correctly in search results
        userAgent: ['Googlebot-Image', 'GoogleFavicon'],
        allow: ['/favicon.png', '/opengraph-image'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',       // Studio Content Engine
          '/login',       // 🛡️ Added: Protect login portal
          '/api/',        // Server actions & Supabase calls
          '/_next/',       // Next.js internal build files
          '/private/',    // Internal assets
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}