import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import ReviewsClient from './ReviewsClient';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('site_content')
    .select('content_value')
    .eq('page_key', 'reviews')
    .eq('section_key', 'seo_description')
    .single();

  return {
    title: "Reviews | RISA Interior & Contractors - Client Perspectives",
    description: data?.content_value || "A documented pulse of global expertise and spatial transformation through our client narratives.",
    alternates: {
      canonical: 'https://www.risainterior.in/reviews',
    },
    openGraph: {
      title: "RISA Interior | Client Narratives",
      description: "Documented experiences of architectural and interior excellence.",
      type: 'website',
    },
  };
}

export default async function ReviewsPage() {
  const supabase = createClient();

  // 🎯 Fetch all approved reviews for stats and initial display
  const { data: allReviews, count } = await supabase
    .from('reviews')
    .select('*', { count: 'exact' })
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  return (
    <ReviewsClient 
      initialReviews={allReviews || []} 
      initialTotalCount={count || 0} 
    />
  );
}