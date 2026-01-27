import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import ServicesClient from './ServicesClient';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  
  // 🎯 SEO: Fetching specific services page SEO description from site_content
  const { data } = await supabase
    .from('site_content')
    .select('content_value')
    .eq('page_key', 'services_page')
    .eq('section_key', 'seo_description')
    .single();

  return {
    title: "Services | RISA Interior - Luxury Architectural & Interior Design",
    description: data?.content_value || "Bespoke architectural solutions, from structural spatial planning to luxury commercial workspace design.",
    keywords: ["Interior Architecture", "Commercial Design", "Luxury Residential Design", "RISA Services"],
    openGraph: {
      title: "RISA Interior | Design Protocol",
      description: "A study in execution and architectural precision.",
      type: 'website',
    },
  };
}

export default function ServicesPage() {
  return <ServicesClient />;
}