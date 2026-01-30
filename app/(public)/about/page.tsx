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
    openGraph: {
      title: "About RISA Interior",
      description: "Our philosophy on architectural precision and high-end design.",
      type: 'website',
    },
  };
}

export default function AboutPage() {
  return <AboutClient />;
}