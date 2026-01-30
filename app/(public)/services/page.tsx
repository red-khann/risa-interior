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
    keywords: ["Interior Architecture", "Commercial Design", "Luxury Residential Design", "RISA Services", "Bareilly Contractors"],
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