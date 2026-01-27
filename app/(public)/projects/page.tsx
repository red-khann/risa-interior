import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import ProjectsClient from './ProjectsClient';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  
  // 🎯 SEO: Fetching specific project page SEO description from site_content
  const { data } = await supabase
    .from('site_content')
    .select('content_value')
    .eq('page_key', 'projects_page')
    .eq('section_key', 'seo_description')
    .single();

  return {
    title: "Portfolio | RISA Interior - Architectural Excellence & Luxury Design",
    description: data?.content_value || "Explore our curated archive of luxury residential and commercial architectural projects.",
    keywords: ["Architectural Portfolio", "Luxury Interior Design", "Modern Architecture", "RISA Projects"],
    openGraph: {
      title: "RISA Interior Portfolio | Selected Works",
      description: "A study in structural honesty and light-filled minimalist architecture.",
      type: 'website',
    },
  };
}

export default function ProjectsPage() {
  return <ProjectsClient />;
}