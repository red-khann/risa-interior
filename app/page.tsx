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
    description: data?.content_value || "Architectural precision meets the poetry of light and shadow. Explore our selected works in luxury interior design and contracting.",
    keywords: ["Interior Design", "Architecture", "Bareilly Contractors", "Luxury Homes", "RISA Interior"],
    openGraph: {
      title: "RISA Interior | Architectural Integrity",
      description: "Selected works in high-end interior design and architectural planning.",
      type: 'website',
    },
  };
}

export default function HomePage() {
  return <HomeClient />;
}