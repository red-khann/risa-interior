import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import HomeClient from './HomeClient';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from('site_content')
    .select('content_value')
    .eq('page_key', 'home')
    .eq('section_key', 'seo_description')
    .single();

  return {
    title: "RISA Interior & Contractors | Luxury Architectural Excellence",
    description: data?.content_value || "Architectural precision meets the poetry of light and shadow.",
    keywords: ["Interior Design", "Architecture", "Bareilly Contractors", "Luxury Homes", "RISA Interior"],
    openGraph: {
      title: "RISA Interior | Architectural Integrity",
      description: "Selected works in high-end interior design and architectural planning.",
      type: 'website',
    },
  };
}

export default async function HomePage() {
  const supabase = createClient();

  // 🎯 DATA PROTOCOL: Fetching all approved reviews for Global Schema
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('status', 'approved');

  const totalReviews = reviews?.length || 0;
  const averageRating = totalReviews > 0 
    ? (reviews!.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "5.0";

  // 🏛️ JSON-LD SCHEMA: Tells Google Search Console about your Star Ratings
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "RISA Interior & Contractors",
    "image": "https://res.cloudinary.com/risa-interior/image/upload/v1768235958/heroimage_mi1qzn.jpg",
    "@id": "https://risa-interior.com", // Replace with your actual domain
    "url": "https://risa-interior.com",
    "telephone": "+91XXXXXXXXXX",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Civil Lines",
      "addressLocality": "Bareilly",
      "addressRegion": "UP",
      "postalCode": "243001",
      "addressCountry": "IN"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": averageRating,
      "reviewCount": totalReviews > 0 ? totalReviews.toString() : "1",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  return (
    <>
      {/* 🎯 Schema Injection: This makes the stars appear in Google Search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}