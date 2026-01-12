import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server'; // Ensure you have a server-side client
import HomeClient from './HomeClient'; // We will move your current code here

// 🎯 SEO: Server-side Metadata fetching
// This allows Google to see your homepage SEO settings without needing JavaScript
export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from('site_content')
    .select('content_value')
    .eq('page_key', 'home')
    .eq('section_key', 'seo_description')
    .single();

  return {
    title: "RISA Studio | Luxury Interior Design & Architectural Excellence",
    description: data?.content_value || "Architectural precision meets the poetry of light and shadow. Explore our selected works in luxury interior design.",
    keywords: ["Interior Design", "Architecture", "Luxury Homes", "Contractors", "Minimalism"],
    openGraph: {
      title: "RISA Studio | Architectural Integrity",
      description: "Selected works in high-end interior design and architectural planning.",
      type: 'website',
    },
  };
}

export default function HomePage() {
  return <HomeClient />;
}