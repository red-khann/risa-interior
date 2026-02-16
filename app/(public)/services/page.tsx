import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import ServicesClient from './ServicesClient';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('site_content')
    .select('content_value')
    .eq('page_key', 'services_page')
    .eq('section_key', 'seo_description')
    .single();

  return {
    title: "Services | RISA Interior & Contractors - Luxury Architectural Design",
    description: data?.content_value || "Bespoke architectural solutions and professional contracting, from spatial planning to luxury commercial design.",
    alternates: {
      canonical: 'https://www.risainterior.in/services',
    },
    keywords: ["Interior Architecture", "Commercial Design", "Luxury Residential Design", "RISA Services", "Bareilly Contractors"],
    openGraph: {
      title: "RISA Interior | Design Protocol",
      description: "A study in execution and architectural precision.",
      type: 'website',
    },
  };
}

export default async function ServicesPage() {
  const supabase = createClient();

  // 🎯 Server-Side Data Fetching
  const { data: serviceData } = await supabase
    .from('services')
    .select('*')
    .eq('status', 'Active');

  const { data: reviewData } = await supabase
    .from('reviews')
    .select('rating, page_slug')
    .eq('page_type', 'service')
    .eq('status', 'approved');

  // Process data on server to include ratings
  const initialServices = serviceData?.map(s => {
    const relevantReviews = reviewData?.filter(r => r.page_slug === s.slug) || [];
    const avg = relevantReviews.length > 0 
      ? relevantReviews.reduce((acc, r) => acc + r.rating, 0) / relevantReviews.length 
      : 0;
    return { ...s, avgRating: avg };
  }) || [];

  return <ServicesClient initialServices={initialServices} />;
}