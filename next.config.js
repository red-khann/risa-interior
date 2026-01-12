/** @type {import('next').Next.Config} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // 🎯 Your primary image host
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',    // 🎯 Allows Supabase storage (just in case)
      },
    ],
  },
};

module.exports = nextConfig;