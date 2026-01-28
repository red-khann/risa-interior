import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.risainterior.in'; // 🎯 Replace with your actual domain

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',       // 🎯 Hide the admin dashboard from Google
          '/api',         // 🎯 Hide backend API routes
          '/_next',       // 🎯 Hide Next.js internal system files
          '/private',     // 🎯 Hide any private folders
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`, // 🎯 Connects your sitemap to the robots file
  };
}