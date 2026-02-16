import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import AboutClient from './AboutClient';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('site_content')
    .select('content_value')
    .eq('page_key', 'about')
    .eq('section_key', 'seo_description')
    .single();

  return {
    title: "About | RISA Interior & Contractors - Architectural Philosophy",
    description: data?.content_value || "Discover the architectural integrity and design philosophy of RISA Interior. Spaces that breathe and inspire through professional contracting and design.",
    alternates: {
      canonical: 'https://www.risainterior.in/about', // Update to your domain
    },
    openGraph: {
      title: "About RISA Interior",
      description: "Our philosophy on architectural precision and high-end design.",
      type: 'website',
    },
  };
}

export default async function AboutPage() {
  const supabase = createClient();

  // 🎯 Server-Side Data Protocol
  // 1. Fetch Project Count
  const { count: projCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Active');

  // 2. Fetch Review Stats
  const { data: reviewData } = await supabase
    .from('reviews')
    .select('rating')
    .eq('status', 'approved');

  const totalReviewsCount = reviewData?.length || 0;
  const averageRatingValue = totalReviewsCount > 0 
    ? reviewData!.reduce((a, b) => a + b.rating, 0) / totalReviewsCount 
    : 5.0;

  return (
    <AboutClient 
      initialProjectsCount={projCount || 0}
      initialAvgRating={averageRatingValue}
      initialReviewsCount={totalReviewsCount}
    />
  );
}